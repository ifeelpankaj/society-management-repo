import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { getFlatLabel, getVisitorName, titleize, visitorPurposes } from "@/features/guard/guard-utils";
import {
  flatFromResponse,
  type SelectedFlat,
  useGuardManualEntry,
} from "@/features/guard/hooks/useGuardManualEntry";
import {
  type ModelsVisitorPurpose,
  useGetV1SocietiesBySocietyIdFlatsAndFlatIdVisitorContextQuery,
  useGetV1SocietiesBySocietyIdFlatsQuery,
} from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

const G = theme.guard;
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
    <View className="mb-3 flex-row items-center gap-2.5">
      <View
        className="h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: G.tealSoft }}
      >
        <Text className="text-[13px] font-bold" style={{ color: G.teal }}>
          {step}
        </Text>
      </View>
      <Text className="text-[15px] font-semibold tracking-tight" style={{ color: G.text }}>
        {title}
      </Text>
    </View>
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
    <View className="gap-1.5">
      <Text className="text-[13px] font-medium" style={{ color: G.textMuted }}>
        {label}
      </Text>
      <View
        className="rounded-2xl bg-white px-4"
        style={{
          height: multiline ? undefined : G.inputHeight,
          minHeight: multiline ? 96 : undefined,
          borderWidth: 1,
          borderColor: error ? "#fca5a5" : focused ? G.teal : G.border,
          boxShadow: focused ? `0 0 0 3px ${G.tealSoft}` : G.cardShadow,
          justifyContent: multiline ? "flex-start" : "center",
          paddingVertical: multiline ? 12 : 0,
        }}
      >
        <TextInput
          cursorColor={G.teal}
          multiline={multiline}
          placeholderTextColor={G.textMuted}
          selectionColor="#99f6e4"
          underlineColorAndroid="transparent"
          className="text-[16px]"
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          style={[
            {
              color: G.text,
              width: "100%",
              borderWidth: 0,
              backgroundColor: "transparent",
              paddingVertical: 0,
              lineHeight: 22,
              textAlignVertical: multiline ? "top" : "center",
            },
            webNoOutline,
            style,
          ]}
          {...props}
        />
      </View>
      {error ? <Text className="text-sm text-rose-500">{error}</Text> : null}
    </View>
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
    <View className="gap-1.5">
      <Text className="text-[13px] font-medium" style={{ color: G.textMuted }}>
        {label}
      </Text>
      <View
        className="flex-row items-center gap-3 rounded-2xl bg-white px-4"
        style={{
          height: G.inputHeight,
          borderWidth: 1,
          borderColor: focused ? G.teal : G.border,
          boxShadow: focused ? `0 0 0 3px ${G.tealSoft}` : G.cardShadow,
        }}
      >
        <SymbolView
          name={{ ios: "magnifyingglass", android: "search", web: "search" }}
          size={20}
          tintColor={focused ? G.teal : G.textMuted}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          className="flex-1 text-[16px]"
          cursorColor={G.teal}
          placeholder={placeholder}
          placeholderTextColor={G.textMuted}
          selectionColor="#99f6e4"
          underlineColorAndroid="transparent"
          value={value}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          style={[
            {
              color: G.text,
              flex: 1,
              height: "100%",
              lineHeight: 22,
              paddingVertical: 0,
              borderWidth: 0,
              backgroundColor: "transparent",
            },
            webNoOutline,
          ]}
        />
      </View>
    </View>
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
      <SafeAreaView className="flex-1" style={{ backgroundColor: G.screenBg }}>
        <View
          className="flex-row items-center gap-2 border-b bg-white px-4 py-3.5"
          style={{ borderColor: G.border }}
        >
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: G.screenBg }}
            onPress={onClose}
          >
            <SymbolView
              name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
              size={20}
              tintColor={G.text}
            />
          </Pressable>
          <View className="flex-1">
            <Text className="text-[18px] font-bold tracking-tight" style={{ color: G.text }}>
              Find flat
            </Text>
            <Text className="text-[13px]" style={{ color: G.textMuted }}>
              Type to see matching flats
            </Text>
          </View>
        </View>

        <View className="border-b px-5 pb-4 pt-3" style={{ borderColor: G.border, backgroundColor: G.screenBg }}>
          <SearchField
            autoFocus={visible}
            placeholder="Flat no., resident, or wing"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {!canSearch ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-[16px] text-slate-500">
              Type to search flats{"\n"}e.g. G-02, left-wing
            </Text>
          </View>
        ) : isLoading ? (
          <ActivityIndicator color={G.teal} style={{ marginTop: 40 }} />
        ) : flats.length === 0 ? (
          <Text className="mt-10 text-center text-slate-500">No flats found</Text>
        ) : (
          <FlatList
            contentContainerClassName="gap-2 px-4 pb-8"
            data={flats}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              total > flats.length ? (
                <Text className="py-3 text-center text-[13px] text-slate-400">
                  {flats.length} of {total} — type more to refine
                </Text>
              ) : isFetching ? (
                <ActivityIndicator color={G.teal} style={{ marginVertical: 8 }} />
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                className="flex-row items-center gap-3 rounded-2xl bg-white px-5 py-4"
                style={{ borderWidth: 1, borderColor: G.border, boxShadow: G.cardShadow }}
                onPress={() => {
                  const flat = flatFromResponse(item);
                  if (flat) {
                    onSelect(flat);
                    onClose();
                  }
                }}
              >
                <Text className="flex-1 text-[17px] font-semibold text-slate-900">
                  {item.flat_number ?? `#${item.id}`}
                </Text>
                <Text className="text-[14px] text-slate-500">
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
    <Pressable
      className="overflow-hidden rounded-[20px] bg-white"
      style={{
        borderWidth: 1,
        borderColor: "#99f6e4",
        boxShadow: G.heroShadow,
      }}
      onPress={onPress}
    >
      <View className="h-[3px] bg-teal-600" />
      <View className="gap-4 p-5">
        <View className="flex-row items-start justify-between">
          <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: G.tealSoft }}>
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              size={24}
              tintColor={G.teal}
            />
          </View>
          <View className="flex-row items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: G.tealSoft }}>
            <Text className="text-[12px] font-semibold" style={{ color: G.teal }}>
              Change
            </Text>
            <SymbolView
              name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
              size={10}
              tintColor={G.teal}
            />
          </View>
        </View>

        {loading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color={G.teal} size="small" />
            <Text className="text-[14px]" style={{ color: G.textMuted }}>
              Loading resident...
            </Text>
          </View>
        ) : (
          <View className="gap-1">
            <Text className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: G.textMuted }}>
              Flat number
            </Text>
            <Text className="text-[26px] font-bold tracking-tight" style={{ color: G.text }}>
              {flat.flat_number ?? `Flat ${flat.id}`}
            </Text>
            <Text className="mt-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: G.textMuted }}>
              Resident
            </Text>
            <Text className="text-[17px] font-semibold" style={{ color: G.text }}>
              {resident ?? "No primary resident"}
            </Text>
            {wingLabel ? (
              <>
                <Text className="mt-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: G.textMuted }}>
                  Wing / Tower
                </Text>
                <Text className="text-[15px] font-medium" style={{ color: G.textMuted }}>
                  {wingLabel}
                </Text>
              </>
            ) : null}
          </View>
        )}
      </View>
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
          className="overflow-hidden rounded-[20px] bg-white"
          style={{
            borderWidth: 1,
            borderColor: error ? "#fca5a5" : G.border,
            boxShadow: G.heroShadow,
            minHeight: 120,
          }}
          onPress={() => setOpen(true)}
        >
          <View className="h-[3px] bg-teal-600" />
          <View className="flex-1 justify-center gap-3 p-5">
            <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: G.tealSoft }}>
              <SymbolView
                name={{ ios: "magnifyingglass", android: "search", web: "search" }}
                size={22}
                tintColor={G.teal}
              />
            </View>
            <View className="gap-1">
              <Text className="text-[18px] font-bold" style={{ color: G.text }}>
                Search flat
              </Text>
              <Text className="text-[14px]" style={{ color: G.textMuted }}>
                Flat no., resident, or wing
              </Text>
            </View>
          </View>
        </Pressable>
      )}

      {error ? <Text className="mt-2 text-sm text-rose-500">{error}</Text> : null}
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
      <ScrollView horizontal contentContainerClassName="gap-2.5 pb-1" showsHorizontalScrollIndicator={false}>
        {visitorPurposes.map((p) => {
          const meta = PURPOSE_META[p];
          const active = value === p;
          return (
            <Pressable
              key={p}
              className="items-center justify-center rounded-[16px]"
              style={{
                width: G.purposeCardWidth,
                height: G.purposeCardHeight,
                backgroundColor: active ? G.teal : "#ffffff",
                borderWidth: active ? 0 : 1,
                borderColor: G.border,
                boxShadow: active ? G.ctaShadow : G.cardShadow,
                transform: active ? [{ scale: 1.04 }] : [{ scale: 1 }],
              }}
              onPress={() => onChange(p)}
            >
              <View
                className="mb-1 h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: active ? "rgba(255,255,255,0.2)" : G.tealSoft }}
              >
                <SymbolView
                  name={{ ios: meta.ios, android: meta.android, web: meta.web }}
                  size={18}
                  tintColor={active ? "#ffffff" : G.teal}
                />
              </View>
              <Text
                className="text-[12px] font-bold"
                style={{ color: active ? "#ffffff" : G.text }}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

type ManualEntryFormProps = {
  societyId: number;
  societyName?: string | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export function ManualEntryForm({ societyId, societyName, onSuccess, onError }: ManualEntryFormProps) {
  const insets = useSafeAreaInsets();
  const form = useGuardManualEntry(societyId);
  const [showExtra, setShowExtra] = useState(false);

  const handleSubmit = async () => {
    const result = await form.submit();
    if (result.success) onSuccess(result.message);
    else onError(result.message);
  };

  const handleCheckIn = async () => {
    const result = await form.handleCheckIn();
    if (result.success) onSuccess(result.message);
    else onError(result.message);
  };

  const canSubmit = form.isFormValid && !form.createEntryState.isLoading;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-4 pt-3"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text className="text-[26px] font-bold tracking-tight" style={{ color: G.text }}>
            Add Visitor
          </Text>
          <Text className="text-[14px]" style={{ color: G.textMuted }}>
            {societyName ? `Gate entry · ${societyName}` : "Quick gate entry"}
          </Text>
        </View>

        <FlatPicker
          error={form.errors.flat}
          selected={form.selectedFlat}
          societyId={societyId}
          onSelect={form.setSelectedFlat}
        />

        <PurposePicker value={form.purpose} onChange={form.setPurpose} />

        <View className="gap-4">
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
        </View>

        <Pressable className="flex-row items-center gap-2 py-1" onPress={() => setShowExtra((v) => !v)}>
          <SymbolView
            name={{
              ios: showExtra ? "minus.circle" : "plus.circle",
              android: showExtra ? "remove_circle" : "add_circle",
              web: showExtra ? "remove_circle" : "add_circle",
            }}
            size={18}
            tintColor={G.teal}
          />
          <Text className="text-[14px] font-medium text-teal-700">
            {showExtra ? "Hide details" : "Additional details"}
          </Text>
          {form.optionalFieldsCount > 0 ? (
            <View className="rounded-full bg-teal-50 px-2 py-0.5">
              <Text className="text-[11px] font-bold text-teal-700">{form.optionalFieldsCount}</Text>
            </View>
          ) : null}
        </Pressable>

        {showExtra ? (
          <View className="gap-4">
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
          </View>
        ) : null}

        {form.createdEntry?.entry ? (
          <View
            className="gap-3 rounded-[20px] bg-white p-5"
            style={{ borderWidth: 1, borderColor: "#99f6e4", boxShadow: G.heroShadow }}
          >
            <Text className="text-[15px] font-semibold text-teal-700">Entry created</Text>
            <Text className="text-[16px] font-medium text-slate-900">
              {getVisitorName(form.createdEntry.entry)}
            </Text>
            <Text className="text-[14px] text-slate-500">
              {getFlatLabel(form.createdEntry.entry)} · {titleize(form.createdEntry.entry.purpose)}
            </Text>
            <View className="flex-row gap-2">
              {form.createdEntry.qrToken && form.createdEntry.entry.status === "approved" ? (
                <Pressable
                  className="flex-1 items-center rounded-xl bg-teal-700 py-3"
                  disabled={form.checkInState.isLoading}
                  onPress={handleCheckIn}
                >
                  <Text className="font-semibold text-white">Check in</Text>
                </Pressable>
              ) : null}
              <Pressable
                className="flex-1 items-center rounded-xl bg-slate-100 py-3"
                onPress={form.clearCreatedEntry}
              >
                <Text className="font-semibold text-slate-700">New entry</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View
        className="bg-white px-5 pt-4"
        style={{
          paddingBottom: Math.max(insets.bottom, 14),
          borderTopWidth: 1,
          borderTopColor: G.border,
          boxShadow: "0 -6px 20px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Pressable
          className="items-center justify-center rounded-[18px]"
          disabled={!canSubmit}
          style={{
            height: G.buttonHeight,
            backgroundColor: canSubmit ? G.teal : "#e2e8f0",
            boxShadow: canSubmit ? G.ctaShadow : undefined,
          }}
          onPress={handleSubmit}
        >
          {form.createEntryState.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              className="text-[17px] font-bold tracking-wide"
              style={{ color: canSubmit ? "#ffffff" : G.textMuted }}
            >
              Create Entry
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
