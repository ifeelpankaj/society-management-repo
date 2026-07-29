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

import { Row, Stack } from "@/components/layout";
import { getFlatLabel, getVisitorName, titleize, visitorPurposes } from "@/features/guard/guard-utils";
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

function StepLabel({ step, title }: { step: number; title: string }) {
  return (
    <Row align="center" gap={10} style={styles.stepLabel}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{step}</Text>
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
    </Row>
  );
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
            borderColor: error ? "#fca5a5" : focused ? colors.guard.teal : colors.guard.border,
            ...(focused ? styles.fieldInputWrapperFocused : shadows.card),
          },
        ]}
      >
        <TextInput
          cursorColor={colors.guard.teal}
          multiline={multiline}
          placeholderTextColor={colors.guard.textMuted}
          selectionColor="#99f6e4"
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
            borderColor: focused ? colors.guard.teal : colors.guard.border,
            ...(focused ? styles.fieldInputWrapperFocused : shadows.card),
          },
        ]}
      >
        <SymbolView
          name={{ ios: "magnifyingglass", android: "search", web: "search" }}
          size={20}
          tintColor={focused ? colors.guard.teal : colors.guard.textMuted}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          cursorColor={colors.guard.teal}
          placeholder={placeholder}
          placeholderTextColor={colors.guard.textMuted}
          selectionColor="#99f6e4"
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

  return (
    <Pressable style={styles.previewCard} onPress={onPress}>
      <View style={styles.previewCardAccent} />
      <Stack gap="lg" style={styles.previewCardBody}>
        <Row align="flex-start" justify="space-between">
          <View style={styles.previewIcon}>
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              size={24}
              tintColor={colors.guard.teal}
            />
          </View>
          <Row align="center" gap="xs" style={styles.changeBadge}>
            <Text style={styles.changeBadgeText}>Change</Text>
            <SymbolView
              name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
              size={10}
              tintColor={colors.guard.teal}
            />
          </Row>
        </Row>

        {loading ? (
          <Row align="center" gap="sm">
            <ActivityIndicator color={colors.guard.teal} size="small" />
            <Text style={styles.loadingResidentText}>Loading resident...</Text>
          </Row>
        ) : (
          <Stack gap="xs">
            <Text style={styles.previewEyebrow}>Flat number</Text>
            <Text style={styles.previewFlatNumber}>
              {flat.flat_number ?? `Flat ${flat.id}`}
            </Text>
            <Text style={[styles.previewEyebrow, styles.previewEyebrowSpaced]}>Resident</Text>
            <Text style={styles.previewResidentName}>
              {resident ?? "No primary resident"}
            </Text>
            {wingLabel ? (
              <>
                <Text style={[styles.previewEyebrow, styles.previewEyebrowSpaced]}>
                  Wing / Tower
                </Text>
                <Text style={styles.previewWingLabel}>{wingLabel}</Text>
              </>
            ) : null}
          </Stack>
        )}
      </Stack>
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
    <View>
      <StepLabel step={1} title="Select flat" />

      {selected ? (
        <ResidentPreviewCard
          flat={selected}
          loading={isFetching}
          resident={resident}
          onPress={() => setOpen(true)}
        />
      ) : (
        <Pressable
          style={[styles.emptyFlatPicker, error && styles.emptyFlatPickerError]}
          onPress={() => setOpen(true)}
        >
          <View style={styles.previewCardAccent} />
          <Stack gap="md" style={styles.emptyFlatPickerBody}>
            <View style={styles.previewIcon}>
              <SymbolView
                name={{ ios: "magnifyingglass", android: "search", web: "search" }}
                size={22}
                tintColor={colors.guard.teal}
              />
            </View>
            <Stack gap="xs">
              <Text style={styles.emptyFlatPickerTitle}>Search flat</Text>
              <Text style={styles.emptyFlatPickerSubtitle}>Flat no., resident, or wing</Text>
            </Stack>
          </Stack>
        </Pressable>
      )}

      {error ? <Text style={styles.flatPickerError}>{error}</Text> : null}
      <FlatSearchModal
        societyId={societyId}
        visible={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </View>
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
    <View>
      <StepLabel step={2} title="Select purpose" />
      <ScrollView
        horizontal
        contentContainerStyle={styles.purposeScrollContent}
        showsHorizontalScrollIndicator={false}
      >
        {visitorPurposes.map((p) => {
          const meta = PURPOSE_META[p];
          const active = value === p;
          return (
            <Pressable
              key={p}
              style={[
                styles.purposeCard,
                active ? styles.purposeCardActive : styles.purposeCardInactive,
              ]}
              onPress={() => onChange(p)}
            >
              <View
                style={[
                  styles.purposeIcon,
                  { backgroundColor: active ? "rgba(255,255,255,0.2)" : colors.guard.tealSoft },
                ]}
              >
                <SymbolView
                  name={{ ios: meta.ios, android: meta.android, web: meta.web }}
                  size={18}
                  tintColor={active ? colors.text.inverse : colors.guard.teal}
                />
              </View>
              <Text style={[styles.purposeLabel, active && styles.purposeLabelActive]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function EntryModeToggle({
  value,
  onChange,
}: {
  value: EntryMode;
  onChange: (mode: EntryMode) => void;
}) {
  return (
    <Row gap="sm" style={styles.entryModeToggle}>
      {(
        [
          { id: "full_entry" as const, label: "Full entry" },
          { id: "form_link" as const, label: "Send form link" },
        ] as const
      ).map((option) => {
        const active = value === option.id;

        return (
          <Pressable
            key={option.id}
            style={[styles.entryModeOption, active && styles.entryModeOptionActive]}
            onPress={() => onChange(option.id)}
          >
            <Text style={[styles.entryModeLabel, active && styles.entryModeLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </Row>
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
      <Text style={styles.successCardTitle}>Form link ready</Text>
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
        <Stack gap="xs">
          <Text style={styles.formTitle}>Add Visitor</Text>
          <Text style={styles.formSubtitle}>
            {societyName ? `Gate entry · ${societyName}` : "Quick gate entry"}
          </Text>
        </Stack>

        <EntryModeToggle value={entryMode} onChange={setEntryMode} />

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
              <StepLabel step={3} title="Visitor details" />
              <Field
                autoCapitalize="words"
                error={form.errors.fullName}
                label="Visitor name"
                placeholder="Full name"
                value={form.fullName}
                onChangeText={form.setFullName}
              />
              <Field
                error={form.errors.phoneNumber}
                keyboardType="phone-pad"
                label="Phone number"
                placeholder="10-digit mobile"
                value={form.phoneNumber}
                onChangeText={form.setPhoneNumber}
              />
            </Stack>

            <Pressable style={styles.extraToggle} onPress={() => setShowExtra((v) => !v)}>
              <SymbolView
                name={{
                  ios: showExtra ? "minus.circle" : "plus.circle",
                  android: showExtra ? "remove_circle" : "add_circle",
                  web: showExtra ? "remove_circle" : "add_circle",
                }}
                size={18}
                tintColor={colors.guard.teal}
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
            <View style={styles.formLinkInfoCard}>
              <Text style={styles.formLinkInfoTitle}>Send a web form link</Text>
              <Text style={styles.formLinkInfoBody}>
                The visitor will open the link, fill their details on web, and receive a gate QR code.
              </Text>
            </View>

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
              {isFormLinkMode ? "Create form link" : "Create Entry"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  changeBadge: {
    backgroundColor: colors.guard.tealSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  changeBadgeText: {
    color: colors.guard.teal,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyFlatPicker: {
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 120,
    overflow: "hidden",
    ...shadows.hero,
  },
  emptyFlatPickerBody: {
    flex: 1,
    justifyContent: "center",
    padding: layout.screenPaddingHorizontal,
  },
  emptyFlatPickerError: {
    borderColor: "#fca5a5",
  },
  emptyFlatPickerSubtitle: {
    color: colors.guard.textMuted,
    fontSize: 14,
  },
  emptyFlatPickerTitle: {
    color: colors.guard.text,
    fontSize: 18,
    fontWeight: "700",
  },
  entryCreatedMeta: {
    color: colors.text.muted,
    fontSize: 14,
  },
  entryModeLabel: {
    color: colors.guard.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  entryModeLabelActive: {
    color: colors.text.inverse,
  },
  entryModeOption: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    paddingVertical: spacing.md,
  },
  entryModeOptionActive: {
    backgroundColor: colors.guard.teal,
  },
  entryModeToggle: {
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xs,
  },
  extraToggle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  extraToggleText: {
    color: colors.guard.teal,
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
    boxShadow: `0 0 0 3px ${colors.guard.tealSoft}`,
  },
  fieldInputWrapperMultiline: {
    height: undefined,
    justifyContent: "flex-start",
    minHeight: 96,
    paddingVertical: spacing.md,
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
  formLinkInfoBody: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  formLinkInfoCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
  },
  formLinkInfoTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
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
  loadingResidentText: {
    color: colors.guard.textMuted,
    fontSize: 14,
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
    backgroundColor: colors.guard.tealSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  optionalCountText: {
    color: colors.guard.teal,
    fontSize: 11,
    fontWeight: "700",
  },
  previewCard: {
    backgroundColor: colors.surface.card,
    borderColor: "#99f6e4",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    ...shadows.hero,
  },
  previewCardAccent: {
    backgroundColor: colors.guard.teal,
    height: 3,
  },
  previewCardBody: {
    padding: layout.screenPaddingHorizontal,
  },
  previewEyebrow: {
    color: colors.guard.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  previewEyebrowSpaced: {
    marginTop: spacing.sm,
  },
  previewFlatNumber: {
    color: colors.guard.text,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  previewIcon: {
    alignItems: "center",
    backgroundColor: colors.guard.tealSoft,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  previewResidentName: {
    color: colors.guard.text,
    fontSize: 17,
    fontWeight: "600",
  },
  previewWingLabel: {
    color: colors.guard.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.guard.teal,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontWeight: "600",
  },
  purposeCard: {
    alignItems: "center",
    borderRadius: radius.lg,
    height: layout.purposeCardHeight,
    justifyContent: "center",
    width: layout.purposeCardWidth,
  },
  purposeCardActive: {
    backgroundColor: colors.guard.teal,
    transform: [{ scale: 1.04 }],
    ...shadows.cta,
  },
  purposeCardInactive: {
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderWidth: 1,
    transform: [{ scale: 1 }],
    ...shadows.card,
  },
  purposeIcon: {
    alignItems: "center",
    borderRadius: radius.lg,
    height: 32,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 32,
  },
  purposeLabel: {
    color: colors.guard.text,
    fontSize: 12,
    fontWeight: "700",
  },
  purposeLabelActive: {
    color: colors.text.inverse,
  },
  purposeScrollContent: {
    gap: 10,
    paddingBottom: spacing.xs,
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
  stepBadge: {
    alignItems: "center",
    backgroundColor: colors.guard.tealSoft,
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  stepBadgeText: {
    color: colors.guard.teal,
    fontSize: 13,
    fontWeight: "700",
  },
  stepLabel: {
    marginBottom: spacing.md,
  },
  stepTitle: {
    color: colors.guard.text,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.3,
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
    backgroundColor: colors.guard.teal,
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
    borderColor: "#99f6e4",
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
