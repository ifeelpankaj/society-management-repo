import { Pressable, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import type { Href } from "expo-router";

import { AppIcon } from "@/components/icons";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { SegmentTabs } from "@/components/ui";
import {
  getDateRangeLabel,
  type DateRangePreset,
  type LogsSegment,
} from "@/features/guard/guard-routes";
import { colors } from "@/theme/colors";
import { theme } from "@/theme";

const G = theme.guard;
const accent = colors.brand.orange;

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
      <GuardBackHeader fallbackHomeRoute={fallbackHomeRoute} title={title} />

      <View style={styles.searchRow}>
        <AppIcon color={G.textMuted} name="search" size={16} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Search visitor..."
          placeholderTextColor={G.textMuted}
          selectionColor={accent}
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
            <AppIcon color={G.text} name="filter" size={17} />
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
          <SegmentTabs compact options={options} value={segment} onChange={onSegmentChange} />

          {!hideDatePicker ? (
            <Pressable accessibilityRole="button" style={styles.dateRow} onPress={onDatePress}>
              <AppIcon color={accent} name="calendar" size={14} />
              <Text style={styles.dateLabel}>{getDateRangeLabel(datePreset)}</Text>
              <Text style={styles.dateChevron}>▼</Text>
            </Pressable>
          ) : segment === "expected" ? (
            <Text style={styles.expectedHint}>Guests invited by flat members (pre-approved)</Text>
          ) : segment === "today" ? (
            <Text style={styles.expectedHint}>Entries with activity today</Text>
          ) : segment === "all" ? (
            <Text style={styles.expectedHint}>All visitor entries</Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clearText: {
    color: accent,
    fontSize: 13,
    fontWeight: "600",
  },
  container: {
    gap: 12,
  },
  dateChevron: {
    color: accent,
    fontSize: 10,
  },
  dateLabel: {
    color: accent,
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
  expectedHint: {
    color: G.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  filterDot: {
    backgroundColor: accent,
    borderRadius: 999,
    height: 7,
    position: "absolute",
    right: 4,
    top: 4,
    width: 7,
  },
  iconButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  searchHint: {
    color: G.textMuted,
    fontSize: 13,
  },
  searchHintTerm: {
    color: G.text,
    fontWeight: "600",
  },
  searchInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    color: G.text,
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    minHeight: 36,
    paddingVertical: 0,
  },
  searchInputWeb: {
    outlineWidth: 0,
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: theme.surface.card,
    borderColor: theme.border.default,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
});
