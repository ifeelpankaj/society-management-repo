import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { Row, Stack } from "@/components/layout";
import {
  dashboardActionToneStyles,
  type DashboardActionTone,
} from "@/components/dashboard";
import { DELIVERY_PARTNERS, DELIVERY_PARTNER_OTHER_LABEL, getFlatLabel, getVisitorName, titleize, visitorPurposes } from "@/features/guard/guard-utils";
import {
  flatFromResponse,
  formatSelectedFlatLabel,
  type SelectedFlat,
  useGuardManualEntry,
} from "@/features/guard/hooks/use-guard-manual-entry";
import { useGuardVisitorInvite } from "@/features/guard/hooks/useGuardVisitorInvite";
import {
  copyVisitorInviteLink,
  formatVisitorInviteShareMessage,
  shareVisitorInvite,
  shareVisitorInviteOnWhatsApp,
} from "@/features/visitors/visitor-invite-share";
import {
  type ModelsFlatResponse,
  type ModelsVisitorEntry,
  type ModelsVisitorPurpose,
  useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorContextQuery,
  useGetV1SocietiesBySocietyIdFlatsQuery,
} from "@/lib/api/generated-api";
import { buildVisitorInviteUrl } from "@/lib/config";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

type EntryMode = "full_entry" | "form_link";

const SEARCH_DEBOUNCE_MS = 400;
const SEARCH_LIMIT = 8;

/** Removes the default black browser outline on web when an input is focused. */
const webNoOutline: TextStyle =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as unknown as TextStyle) : {};

const PURPOSE_META = {
  guest: { ios: "person.fill", android: "person", web: "person", label: "Guest" },
  delivery: { ios: "shippingbox.fill", android: "local_shipping", web: "local_shipping", label: "Delivery" },
  cab: { ios: "car.fill", android: "local_taxi", web: "local_taxi", label: "Cab" },
  service: { ios: "wrench.fill", android: "build", web: "build", label: "Service" },
  maintenance: { ios: "hammer.fill", android: "handyman", web: "handyman", label: "Maint." },
  staff: { ios: "person.badge.shield.checkmark.fill", android: "badge", web: "badge", label: "Staff" },
  other: { ios: "ellipsis.circle.fill", android: "more_horiz", web: "more_horiz", label: "Other" },
} as const;

const PURPOSE_TONES: Record<ModelsVisitorPurpose, DashboardActionTone> = {
  guest: "blue",
  delivery: "orange",
  cab: "purple",
  service: "neutral",
  maintenance: "orange",
  staff: "blue",
  other: "neutral",
};

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Field({
  label,
  error,
  multiline,
  style,
  onBlur,
  onFocus,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <Stack gap={6}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.fieldInputWrapper,
          multiline && styles.fieldInputWrapperMultiline,
          {
            borderColor: error ? "#fca5a5" : focused ? colors.brand.orange : colors.guard.border,
            ...(focused ? styles.fieldInputWrapperFocused : shadows.sm),
          },
        ]}
      >
        <TextInput
          cursorColor={colors.brand.orange}
          multiline={multiline}
          placeholderTextColor={colors.guard.textMuted}
          selectionColor={colors.accent.selection}
          underlineColorAndroid="transparent"
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          style={[
            styles.fieldInput,
            multiline && styles.fieldInputMultiline,
            webNoOutline,
            style,
          ]}
          {...props}
        />
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </Stack>
  );
}

function SearchField({
  label = "Search flat",
  value,
  onChangeText,
  placeholder,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Stack gap={6}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Row
        align="center"
        gap="md"
        style={[
          styles.searchFieldWrapper,
          {
            borderColor: focused ? colors.brand.orange : colors.guard.border,
            ...(focused ? styles.fieldInputWrapperFocused : shadows.sm),
          },
        ]}
      >
        <SymbolView
          name={{ ios: "magnifyingglass", android: "search", web: "search" }}
          size={20}
          tintColor={focused ? colors.brand.orange : colors.guard.textMuted}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          cursorColor={colors.brand.orange}
          placeholder={placeholder}
          placeholderTextColor={colors.guard.textMuted}
          selectionColor={colors.accent.selection}
          underlineColorAndroid="transparent"
          value={value}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          style={[styles.searchInput, webNoOutline]}
        />
      </Row>
    </Stack>
  );
}

function FlatSearchModal({
  visible,
  societyId,
  onClose,
  onSelect,
}: {
  visible: boolean;
  societyId: number;
  onClose: () => void;
  onSelect: (flat: SelectedFlat) => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!visible) {
      setQuery("");
      setDebounced("");
    }
  }, [visible]);

  const canSearch = debounced.length > 0;
  const { data, isFetching, isLoading } = useGetV1SocietiesBySocietyIdFlatsQuery(
    { societyId, search: debounced, status: "occupied", isActive: true, limit: SEARCH_LIMIT },
    { skip: !visible || !canSearch },
  );

  const flats = data?.data?.flats?.items ?? [];
  const total = data?.data?.flats?.total ?? 0;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalScreen}>
        <AppStatusBar />
        <Row align="center" gap="sm" style={styles.modalHeader}>
          <Pressable style={styles.modalBackButton} onPress={onClose}>
            <SymbolView
              name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
              size={20}
              tintColor={colors.guard.text}
            />
          </Pressable>
          <View style={styles.modalHeaderText}>
            <Text style={styles.modalTitle}>Find flat</Text>
            <Text style={styles.modalSubtitle}>Type to see matching flats</Text>
          </View>
        </Row>

        <View style={styles.modalSearchSection}>
          <SearchField
            autoFocus={visible}
            placeholder="Flat no., resident, or wing"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {!canSearch ? (
          <View style={styles.modalEmptyState}>
            <Text style={styles.modalEmptyStateText}>
              Type to search flats{"\n"}e.g. G-02, left-wing
            </Text>
          </View>
        ) : isLoading ? (
          <ActivityIndicator color={colors.guard.teal} style={styles.modalLoading} />
        ) : flats.length === 0 ? (
          <Text style={styles.modalNoResults}>No flats found</Text>
        ) : (
          <FlatList
            contentContainerStyle={styles.modalListContent}
            data={flats}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              total > flats.length ? (
                <Text style={styles.modalListFooter}>
                  {flats.length} of {total} — type more to refine
                </Text>
              ) : isFetching ? (
                <ActivityIndicator color={colors.guard.teal} style={styles.modalListLoading} />
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.flatListItem}
                onPress={() => {
                  const flat = flatFromResponse(item);
                  if (flat) {
                    onSelect(flat);
                    onClose();
                  }
                }}
              >
                <Text style={styles.flatListItemNumber}>
                  {item.flat_number ?? `#${item.id}`}
                </Text>
                <Text style={styles.flatListItemMeta}>
                  {item.block ? `Wing ${item.block}` : item.floor ? `Floor ${item.floor}` : ""}
                </Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

function ResidentPreviewCard({
  flat,
  resident,
  loading,
  onPress,
}: {
  flat: SelectedFlat;
  resident?: string | null;
  loading?: boolean;
  onPress: () => void;
}) {
  const wingLabel = flat.block
    ? `Wing ${flat.block}`
    : flat.floor
      ? `Tower ${flat.floor}`
      : null;
  const residentLine = loading
    ? "Loading resident..."
    : [resident ?? "No primary resident", wingLabel].filter(Boolean).join(" · ");

  return (
    <Pressable style={styles.flatSearchCard} onPress={onPress}>
      <View
        style={[
          styles.flatSearchIcon,
          { backgroundColor: dashboardActionToneStyles.blue.backgroundColor },
        ]}
      >
        <SymbolView
          name={{ ios: "house.fill", android: "home", web: "home" }}
          size={24}
          tintColor={dashboardActionToneStyles.blue.iconColor}
        />
      </View>
      <Stack gap={2} style={styles.flatSearchCopy}>
        <Text style={styles.flatSearchTitle}>{flat.flat_number ?? `Flat ${flat.id}`}</Text>
        <Text numberOfLines={1} style={styles.flatSearchSubtitle}>
          {residentLine}
        </Text>
      </Stack>
      <Row align="center" gap="xs" style={styles.changeBadge}>
        <Text style={styles.changeBadgeText}>Change</Text>
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
          size={10}
          tintColor={colors.brand.orange}
        />
      </Row>
    </Pressable>
  );
}

function FlatPicker({
  societyId,
  selected,
  error,
  onSelect,
}: {
  societyId: number;
  selected: SelectedFlat | null;
  error?: string;
  onSelect: (flat: SelectedFlat) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorContextQuery(
    { societyId, flatId: selected?.id ?? 0 },
    { skip: !selected?.id },
  );
  const resident = data?.data?.context?.primary_resident?.full_name;

  return (
    <Stack gap="md">
      <SectionHeader title="Select flat" />

      {selected ? (
        <ResidentPreviewCard
          flat={selected}
          loading={isFetching}
          resident={resident}
          onPress={() => setOpen(true)}
        />
      ) : (
        <Pressable
          style={[styles.flatSearchCard, error && styles.flatSearchCardError]}
          onPress={() => setOpen(true)}
        >
          <View
            style={[
              styles.flatSearchIcon,
              { backgroundColor: dashboardActionToneStyles.blue.backgroundColor },
            ]}
          >
            <SymbolView
              name={{ ios: "magnifyingglass", android: "search", web: "search" }}
              size={24}
              tintColor={dashboardActionToneStyles.blue.iconColor}
            />
          </View>
          <Stack gap={2} style={styles.flatSearchCopy}>
            <Text style={styles.flatSearchTitle}>Search flat</Text>
            <Text style={styles.flatSearchSubtitle}>Flat no., resident, or wing</Text>
          </Stack>
          <SymbolView
            name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
            size={16}
            tintColor={colors.guard.textMuted}
          />
        </Pressable>
      )}

      {error ? <Text style={styles.flatPickerError}>{error}</Text> : null}
      <FlatSearchModal
        societyId={societyId}
        visible={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </Stack>
  );
}

function PurposePicker({
  value,
  onChange,
}: {
  value: ModelsVisitorPurpose;
  onChange: (p: ModelsVisitorPurpose) => void;
}) {
  return (
    <Stack gap="md">
      <SectionHeader title="Select purpose" />
      <View style={styles.purposeGrid}>
        {visitorPurposes.map((p) => {
          const meta = PURPOSE_META[p];
          const tone = PURPOSE_TONES[p];
          const toneStyle = dashboardActionToneStyles[tone];
          const active = value === p;

          return (
            <Pressable
              key={p}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.purposeTile,
                {
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              onPress={() => onChange(p)}
            >
              <View
                style={[
                  styles.purposeIconWrap,
                  { backgroundColor: toneStyle.backgroundColor },
                  active && styles.purposeIconWrapActive,
                ]}
              >
                <SymbolView
                  name={{ ios: meta.ios, android: meta.android, web: meta.web }}
                  size={24}
                  tintColor={toneStyle.iconColor}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.purposeTileLabel, active && styles.purposeTileLabelActive]}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Stack>
  );
}

function EntryLinkModeButton({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Send visitor link"
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.linkModeButton,
        active && styles.linkModeButtonActive,
        pressed && styles.linkModeButtonPressed,
      ]}
      onPress={onPress}
    >
      <SymbolView
        name={{ ios: "link", android: "link", web: "link" }}
        size={20}
        tintColor={active ? colors.brand.orange : colors.text.placeholder}
      />
    </Pressable>
  );
}

function InviteLinkSuccessCard({
  invite,
  onClear,
}: {
  invite: {
    purpose: ModelsVisitorPurpose;
    token: string;
    expiresAt?: string;
    flat?: SelectedFlat | null;
  };
  onClear: () => void;
}) {
  const formUrl = buildVisitorInviteUrl(invite.token);
  const shareMessage = formatVisitorInviteShareMessage(invite);

  return (
    <Stack gap="md" style={styles.successCard}>
      <Text style={styles.successCardTitle}>Link ready</Text>
      <Text style={styles.successCardSubtitle}>
        {titleize(invite.purpose)} · {formatSelectedFlatLabel(invite.flat)}
      </Text>
      <Text selectable style={styles.successCardUrl}>
        {formUrl}
      </Text>
      {invite.expiresAt ? (
        <Text style={styles.successCardExpiry}>
          Expires {new Date(invite.expiresAt).toLocaleString()}
        </Text>
      ) : null}
      <Stack gap="sm">
        <Pressable
          style={styles.primaryButton}
          onPress={() => shareVisitorInviteOnWhatsApp(shareMessage)}
        >
          <Text style={styles.primaryButtonText}>Share on WhatsApp</Text>
        </Pressable>
        <Row gap="sm">
          <Pressable
            style={styles.secondaryButton}
            onPress={() => copyVisitorInviteLink(invite.token)}
          >
            <Text style={styles.secondaryButtonText}>Copy link</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => shareVisitorInvite(shareMessage)}
          >
            <Text style={styles.secondaryButtonText}>Share</Text>
          </Pressable>
        </Row>
        <Pressable style={styles.secondaryButton} onPress={onClear}>
          <Text style={styles.secondaryButtonText}>New link</Text>
        </Pressable>
      </Stack>
    </Stack>
  );
}

type ManualEntryFormProps = {
  societyId: number;
  societyName?: string | null;
  onEntryCreated?: (result: { entry?: ModelsVisitorEntry; qrToken?: string }) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export function ManualEntryForm({
  societyId,
  societyName,
  onEntryCreated,
  onSuccess,
  onError,
}: ManualEntryFormProps) {
  const insets = useSafeAreaInsets();
  const form = useGuardManualEntry(societyId);
  const inviteForm = useGuardVisitorInvite(societyId);
  const [entryMode, setEntryMode] = useState<EntryMode>("full_entry");
  const [showExtra, setShowExtra] = useState(false);

  const handleSubmit = async () => {
    if (entryMode === "form_link") {
      const result = await inviteForm.submit();
      if (result.success) onSuccess(result.message);
      else onError(result.message);
      return;
    }

    const result = await form.submit();
    if (result.success) {
      onEntryCreated?.({ entry: result.entry, qrToken: result.qrToken });
      onSuccess(result.message);
    } else onError(result.message);
  };

  const isFormLinkMode = entryMode === "form_link";
  const canSubmit = isFormLinkMode
    ? inviteForm.isFormValid && !inviteForm.createInviteState.isLoading
    : form.isFormValid && !form.createEntryState.isLoading;
  const isSubmitting = isFormLinkMode
    ? inviteForm.createInviteState.isLoading
    : form.createEntryState.isLoading;
  const selectedFlat = isFormLinkMode ? inviteForm.selectedFlat : form.selectedFlat;
  const flatError = isFormLinkMode ? inviteForm.flatError : form.errors.flat;
  const purpose = isFormLinkMode ? inviteForm.purpose : form.purpose;
  const setSelectedFlat = isFormLinkMode ? inviteForm.setSelectedFlat : form.setSelectedFlat;
  const setPurpose = isFormLinkMode ? inviteForm.setPurpose : form.setPurpose;

  return (
    <View style={styles.formRoot}>
      <ScrollView
        contentContainerStyle={styles.formScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.formScroll}
      >
        <Row align="center" justify="space-between">
          <Stack gap="xs" style={styles.formTitleBlock}>
            <Text style={styles.formTitle}>Add Visitor</Text>
            <Text style={styles.formSubtitle}>
              {isFormLinkMode
                ? "Visitor fills details online and gets a gate QR code."
                : societyName
                  ? `Gate entry · ${societyName}`
                  : "Quick gate entry"}
            </Text>
          </Stack>
          <EntryLinkModeButton
            active={isFormLinkMode}
            onPress={() =>
              setEntryMode((mode) => (mode === "form_link" ? "full_entry" : "form_link"))
            }
          />
        </Row>

        <FlatPicker
          error={flatError}
          selected={selectedFlat}
          societyId={societyId}
          onSelect={setSelectedFlat}
        />

        <PurposePicker value={purpose} onChange={setPurpose} />

        {!isFormLinkMode ? (
          <>
            <Stack gap="lg">
              <SectionHeader title="Visitor details" />
              {form.purpose !== "delivery" ? (
                <Field
                  autoCapitalize="words"
                  error={form.errors.fullName}
                  label={form.purpose === "cab" ? "Driver name" : "Visitor name"}
                  placeholder="Full name"
                  value={form.fullName}
                  onChangeText={form.setFullName}
                />
              ) : null}
              <Field
                error={form.errors.phoneNumber}
                keyboardType="phone-pad"
                label="Phone number"
                placeholder={form.purpose === "cab" ? "Optional" : "10-digit mobile"}
                value={form.phoneNumber}
                onChangeText={form.setPhoneNumber}
              />
              {form.purpose === "guest" ? (
                <Field
                  error={form.errors.companionsCount}
                  keyboardType="number-pad"
                  label="Companion count"
                  placeholder="0"
                  value={String(form.companionsCount)}
                  onChangeText={(value) => form.setCompanionsCount(Number(value.replace(/\D/g, "") || 0))}
                />
              ) : null}
              {form.purpose === "delivery" ? (
                <>
                  <Text style={styles.fieldLabel}>Delivery partner</Text>
                  <View style={styles.partnerChipGrid}>
                    {DELIVERY_PARTNERS.map((partner) => {
                      const active =
                        !form.deliveryPartnerIsOther && form.deliveryPartner === partner;
                      return (
                        <Pressable
                          key={partner}
                          style={[styles.partnerChip, active && styles.partnerChipActive]}
                          onPress={() => form.selectDeliveryPartner(partner)}
                        >
                          <Text style={[styles.partnerChipText, active && styles.partnerChipTextActive]}>
                            {partner}
                          </Text>
                        </Pressable>
                      );
                    })}
                    <Pressable
                      style={[
                        styles.partnerChip,
                        form.deliveryPartnerIsOther && styles.partnerChipActive,
                      ]}
                      onPress={form.selectCustomDeliveryPartner}
                    >
                      <Text
                        style={[
                          styles.partnerChipText,
                          form.deliveryPartnerIsOther && styles.partnerChipTextActive,
                        ]}
                      >
                        {DELIVERY_PARTNER_OTHER_LABEL}
                      </Text>
                    </Pressable>
                  </View>
                  {form.deliveryPartnerIsOther ? (
                    <Field
                      autoCapitalize="words"
                      error={form.errors.deliveryPartner}
                      label="Delivery from"
                      placeholder="Company or service name"
                      value={form.deliveryPartner}
                      onChangeText={form.setDeliveryPartner}
                    />
                  ) : null}
                  {!form.deliveryPartnerIsOther && form.errors.deliveryPartner ? (
                    <Text style={styles.flatPickerError}>{form.errors.deliveryPartner}</Text>
                  ) : null}
                </>
              ) : null}
              {form.purpose === "cab" ? (
                <>
                  <Field
                    autoCapitalize="characters"
                    error={form.errors.vehicleNumber}
                    label="Vehicle number"
                    placeholder="Required"
                    value={form.vehicleNumber}
                    onChangeText={form.setVehicleNumber}
                  />
                  <Text style={styles.fieldLabel}>Vehicle type</Text>
                  <Row align="center" gap={8} style={styles.vehicleTypeRow}>
                    {(["cab", "auto", "car", "bike"] as const).map((type) => {
                      const active = form.vehicleType === type;
                      return (
                        <Pressable
                          key={type}
                          style={[styles.partnerChip, active && styles.partnerChipActive]}
                          onPress={() => form.setVehicleType(type)}
                        >
                          <Text style={[styles.partnerChipText, active && styles.partnerChipTextActive]}>
                            {titleize(type)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </Row>
                  {form.errors.vehicleType ? (
                    <Text style={styles.flatPickerError}>{form.errors.vehicleType}</Text>
                  ) : null}
                </>
              ) : null}
              {form.purpose === "service" || form.purpose === "maintenance" ? (
                <Field
                  error={form.errors.serviceProvider}
                  label={form.purpose === "maintenance" ? "Vendor / company" : "Service provider"}
                  placeholder="Required"
                  value={form.serviceProvider}
                  onChangeText={form.setServiceProvider}
                />
              ) : null}
            </Stack>

            <Pressable style={styles.extraToggle} onPress={() => setShowExtra((v) => !v)}>
              <SymbolView
                name={{
                  ios: showExtra ? "minus.circle" : "plus.circle",
                  android: showExtra ? "remove_circle" : "add_circle",
                  web: showExtra ? "remove_circle" : "add_circle",
                }}
                size={18}
                tintColor={colors.brand.orange}
              />
              <Text style={styles.extraToggleText}>
                {showExtra ? "Hide details" : "Additional details"}
              </Text>
              {form.optionalFieldsCount > 0 ? (
                <View style={styles.optionalCountBadge}>
                  <Text style={styles.optionalCountText}>{form.optionalFieldsCount}</Text>
                </View>
              ) : null}
            </Pressable>

            {showExtra ? (
              <Stack gap="lg">
                <Field
                  autoCapitalize="none"
                  keyboardType="email-address"
                  label="Email"
                  placeholder="Optional"
                  value={form.email}
                  onChangeText={form.setEmail}
                />
                <Field
                  autoCapitalize="characters"
                  label="Vehicle number"
                  placeholder="Optional"
                  value={form.vehicleNumber}
                  onChangeText={form.setVehicleNumber}
                />
                <Field
                  label="Notes"
                  multiline
                  placeholder="Optional"
                  value={form.notes}
                  onChangeText={form.setNotes}
                />
              </Stack>
            ) : null}

            {form.createdEntry?.entry ? (
              <Stack gap="md" style={styles.successCard}>
                <Text style={styles.successCardTitle}>Entry created</Text>
                <Text style={styles.successCardSubtitle}>
                  {getVisitorName(form.createdEntry.entry)}
                </Text>
                <Text style={styles.entryCreatedMeta}>
                  {getFlatLabel(form.createdEntry.entry)} · {titleize(form.createdEntry.entry.purpose)}
                </Text>
                {form.createdEntry.qrToken ? (
                  <Text style={styles.successHint}>
                    QR token generated. You can proceed to check-in.
                  </Text>
                ) : (
                  <Text style={styles.successHint}>
                    Check-in will be available when a QR token is generated.
                  </Text>
                )}
                <Pressable
                  style={[styles.secondaryButton, styles.flexButton]}
                  onPress={form.clearCreatedEntry}
                >
                  <Text style={styles.secondaryButtonText}>New entry</Text>
                </Pressable>
              </Stack>
            ) : null}
          </>
        ) : (
          <>
            {inviteForm.createdInvite ? (
              <InviteLinkSuccessCard
                invite={inviteForm.createdInvite}
                onClear={inviteForm.clearCreatedInvite}
              />
            ) : null}
          </>
        )}
      </ScrollView>

      <View
        style={[
          styles.formFooter,
          { paddingBottom: Math.max(insets.bottom, 14) },
        ]}
      >
        <Pressable
          disabled={!canSubmit}
          style={[
            styles.submitButton,
            canSubmit ? styles.submitButtonEnabled : styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text
              style={[
                styles.submitButtonText,
                !canSubmit && styles.submitButtonTextDisabled,
              ]}
            >
              {isFormLinkMode ? "Create link" : "Create Entry"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  changeBadge: {
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  changeBadgeText: {
    color: colors.brand.orange,
    fontSize: 12,
    fontWeight: "600",
  },
  flatSearchCard: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  flatSearchCardError: {
    borderColor: "#fca5a5",
  },
  flatSearchCopy: {
    flex: 1,
    minWidth: 0,
  },
  flatSearchIcon: {
    alignItems: "center",
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  flatSearchSubtitle: {
    color: colors.guard.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  flatSearchTitle: {
    color: colors.guard.text,
    fontSize: 16,
    fontWeight: "700",
  },
  entryCreatedMeta: {
    color: colors.text.muted,
    fontSize: 14,
  },
  extraToggle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  extraToggleText: {
    color: colors.brand.orange,
    fontSize: 14,
    fontWeight: "500",
  },
  fieldError: {
    color: colors.status.error,
    fontSize: 14,
  },
  fieldInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    color: colors.guard.text,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
    width: "100%",
  },
  fieldInputMultiline: {
    textAlignVertical: "top",
  },
  fieldInputWrapper: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: layout.inputHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  fieldInputWrapperFocused: {
    boxShadow: `0 0 0 3px ${colors.brand.orangeSoft}`,
  },
  fieldInputWrapperMultiline: {
    height: undefined,
    justifyContent: "flex-start",
    minHeight: 96,
    paddingVertical: spacing.md,
  },
  partnerChip: {
    backgroundColor: colors.dashboard.actionNeutralSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  partnerChipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  partnerChipActive: {
    backgroundColor: colors.brand.orangeSoft,
  },
  partnerChipText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  partnerChipTextActive: {
    color: colors.brand.orange,
  },
  vehicleTypeRow: {
    flexWrap: "wrap",
  },
  fieldLabel: {
    color: colors.guard.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  flatListItem: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    ...shadows.card,
  },
  flatListItemMeta: {
    color: colors.text.muted,
    fontSize: 14,
  },
  flatListItemNumber: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  flatPickerError: {
    color: colors.status.error,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  formFooter: {
    backgroundColor: colors.surface.card,
    borderTopColor: colors.guard.border,
    borderTopWidth: 1,
    boxShadow: "0 -6px 20px rgba(15, 23, 42, 0.06)",
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
  },
  formRoot: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    gap: spacing["2xl"],
    paddingBottom: spacing.lg,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
  },
  formSubtitle: {
    color: colors.guard.textMuted,
    fontSize: 14,
  },
  formTitle: {
    color: colors.guard.text,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  formTitleBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  linkModeButton: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
    ...shadows.sm,
  },
  linkModeButtonActive: {
    backgroundColor: colors.brand.orangeSoft,
    borderColor: colors.brand.orange,
  },
  linkModeButtonPressed: {
    opacity: 0.7,
  },
  modalBackButton: {
    alignItems: "center",
    backgroundColor: colors.guard.screenBg,
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  modalEmptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing["3xl"],
  },
  modalEmptyStateText: {
    color: colors.text.muted,
    fontSize: 16,
    textAlign: "center",
  },
  modalHeader: {
    backgroundColor: colors.surface.card,
    borderBottomColor: colors.guard.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalListContent: {
    gap: spacing.sm,
    paddingBottom: spacing["2xl"],
    paddingHorizontal: spacing.lg,
  },
  modalListFooter: {
    color: colors.text.placeholder,
    fontSize: 13,
    paddingVertical: spacing.md,
    textAlign: "center",
  },
  modalListLoading: {
    marginVertical: spacing.sm,
  },
  modalLoading: {
    marginTop: 40,
  },
  modalNoResults: {
    color: colors.text.muted,
    marginTop: 40,
    textAlign: "center",
  },
  modalScreen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  modalSearchSection: {
    backgroundColor: colors.guard.screenBg,
    borderBottomColor: colors.guard.border,
    borderBottomWidth: 1,
    paddingBottom: spacing.lg,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
  },
  modalSubtitle: {
    color: colors.guard.textMuted,
    fontSize: 13,
  },
  modalTitle: {
    color: colors.guard.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  optionalCountBadge: {
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  optionalCountText: {
    color: colors.brand.orange,
    fontSize: 11,
    fontWeight: "700",
  },
  purposeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "flex-start",
  },
  purposeIconWrap: {
    alignItems: "center",
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  purposeIconWrapActive: {
    borderColor: colors.brand.orange,
    borderWidth: 2,
  },
  purposeTile: {
    alignItems: "center",
    gap: spacing.sm,
    width: "22%",
    minWidth: 72,
  },
  purposeTileLabel: {
    color: colors.guard.textMuted,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  purposeTileLabelActive: {
    color: colors.guard.text,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand.orange,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontWeight: "600",
  },
  sectionTitle: {
    color: colors.guard.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  searchFieldWrapper: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: layout.inputHeight,
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    color: colors.guard.text,
    flex: 1,
    fontSize: 16,
    height: "100%",
    lineHeight: 22,
    paddingVertical: 0,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.surface.screen,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontWeight: "600",
  },
  submitButton: {
    alignItems: "center",
    borderRadius: radius.xl,
    height: layout.buttonHeight,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.border.default,
  },
  submitButtonEnabled: {
    backgroundColor: colors.brand.orange,
    ...shadows.cta,
  },
  submitButtonText: {
    color: colors.text.inverse,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  submitButtonTextDisabled: {
    color: colors.guard.textMuted,
  },
  successCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.accent.selection,
    borderRadius: 20,
    borderWidth: 1,
    padding: layout.screenPaddingHorizontal,
    ...shadows.hero,
  },
  successCardExpiry: {
    color: colors.text.muted,
    fontSize: 13,
  },
  successCardSubtitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  successCardTitle: {
    color: colors.guard.teal,
    fontSize: 15,
    fontWeight: "600",
  },
  successHint: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  successCardUrl: {
    backgroundColor: colors.surface.screen,
    borderRadius: radius.lg,
    color: colors.text.secondary,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
