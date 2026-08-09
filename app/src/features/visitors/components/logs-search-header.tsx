import { Pressable, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SymbolView } from "expo-symbols";
import type { Href } from "expo-router";

import { ScreenBackHeader } from "@/components/layout/screen-back-header";
import { SegmentTabs } from "@/components/ui";
import { guardHomeRoute } from "@/features/guard/guard-routes";
import {
  getDateRangeLabel,
  type DateRangePreset,
  type LogsSegment,
} from "@/features/visitors/visitor-date-ranges";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

const DEFAULT_SEGMENT_OPTIONS: { label: string; value: LogsSegment }[] = [
  { label: "Today", value: "today" },
  { label: "Expected", value: "expected" },
  { label: "Inside", value: "inside" },
  { label: "All", value: "all" },
];

type LogsSearchHeaderProps<T extends string = LogsSegment> = {
  activeFilterCount: number;
  datePreset: DateRangePreset;
  fallbackHomeRoute?: Href;
  isSearchActive: boolean;
  onClearSearch: () => void;
  onDatePress: () => void;
  onFilterPress: () => void;
  onSearchChange: (value: string) => void;
  onSegmentChange: (segment: T) => void;
  searchValue: string;
  segment: T;
  segmentOptions?: { label: string; value: T }[];
  title?: string;
};

export function LogsSearchHeader<T extends string = LogsSegment>({
  activeFilterCount,
  datePreset,
  fallbackHomeRoute,
  isSearchActive,
  onClearSearch,
  onDatePress,
  onFilterPress,
  onSearchChange,
  onSegmentChange,
  searchValue,
  segment,
  segmentOptions,
  title = "Visitor Logs",
}: LogsSearchHeaderProps<T>) {
  const options = segmentOptions ?? (DEFAULT_SEGMENT_OPTIONS as { label: string; value: T }[]);
  const hideDatePicker = segment === "expected" || segment === "today" || segment === "all";

  return (
    <View style={styles.container}>
      <ScreenBackHeader fallbackHomeRoute={fallbackHomeRoute ?? guardHomeRoute()} title={title} />

      <View style={styles.searchRow}>
        <SymbolView
          name={{ ios: "magnifyingglass", android: "search", web: "search" }}
          size={18}
          tintColor={colors.brand.orange}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Search visitor by name, phone, flat ..."
          placeholderTextColor={colors.guard.textMuted}
          selectionColor={colors.brand.orange}
          style={[styles.searchInput, Platform.OS === "web" ? styles.searchInputWeb : null]}
          value={searchValue}
          onChangeText={onSearchChange}
        />
        {isSearchActive ? (
          <Pressable
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={8}
            style={styles.iconButton}
            onPress={onClearSearch}
          >
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="Open filters"
            accessibilityRole="button"
            hitSlop={8}
            style={styles.iconButton}
            onPress={onFilterPress}
          >
            <SymbolView
              name={{ ios: "line.3.horizontal.decrease", android: "filter_list", web: "filter_list" }}
              size={18}
              tintColor={colors.guard.text}
            />
            {activeFilterCount > 0 ? <View style={styles.filterDot} /> : null}
          </Pressable>
        )}
      </View>

      {isSearchActive ? (
        <Text style={styles.searchHint}>
          Showing results for{" "}
          <Text style={styles.searchHintTerm}>"{searchValue.trim()}"</Text>
        </Text>
      ) : (
        <>
          <SegmentTabs
            compact
            options={options}
            value={segment}
            variant="underline"
            onChange={onSegmentChange}
          />

          {!hideDatePicker ? (
            <Pressable accessibilityRole="button" style={styles.dateRow} onPress={onDatePress}>
              <SymbolView
                name={{ ios: "calendar", android: "calendar_today", web: "calendar_today" }}
                size={14}
                tintColor={colors.brand.orange}
              />
              <Text style={styles.dateLabel}>{getDateRangeLabel(datePreset)}</Text>
              <SymbolView
                name={{ ios: "chevron.down", android: "expand_more", web: "expand_more" }}
                size={12}
                tintColor={colors.brand.orange}
              />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clearText: {
    color: colors.brand.orange,
    fontSize: 13,
    fontWeight: "600",
  },
  container: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  dateLabel: {
    color: colors.brand.orange,
    fontSize: 13,
    fontWeight: "600",
  },
  dateRow: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  filterDot: {
    backgroundColor: colors.brand.orange,
    borderRadius: 999,
    height: 7,
    position: "absolute",
    right: 2,
    top: 2,
    width: 7,
  },
  iconButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  searchHint: {
    color: colors.guard.textMuted,
    fontSize: 13,
  },
  searchHintTerm: {
    color: colors.guard.text,
    fontWeight: "600",
  },
  searchInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    color: colors.guard.text,
    flex: 1,
    fontSize: 14,
    marginLeft: spacing.sm,
    minHeight: 40,
    paddingVertical: 0,
  },
  searchInputWeb: {
    outlineWidth: 0,
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: "#F1E4DA",
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
});
