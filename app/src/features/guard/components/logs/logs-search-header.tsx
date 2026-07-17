import { Pressable, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { SegmentTabs } from "@/components/ui";
import {
  getDateRangeLabel,
  type DateRangePreset,
  type LogsSegment,
} from "@/features/guard/guard-routes";
import { theme } from "@/lib/theme";

const G = theme.guard;

const SEGMENT_OPTIONS: { label: string; value: LogsSegment }[] = [
  { label: "Today", value: "today" },
  { label: "Expected", value: "expected" },
  { label: "Pending", value: "pending" },
  { label: "Inside", value: "inside" },
];

type LogsSearchHeaderProps = {
  activeFilterCount: number;
  datePreset: DateRangePreset;
  isSearchActive: boolean;
  onClearSearch: () => void;
  onDatePress: () => void;
  onFilterPress: () => void;
  onSearchChange: (value: string) => void;
  onSegmentChange: (segment: LogsSegment) => void;
  searchValue: string;
  segment: LogsSegment;
};

export function LogsSearchHeader({
  activeFilterCount,
  datePreset,
  isSearchActive,
  onClearSearch,
  onDatePress,
  onFilterPress,
  onSearchChange,
  onSegmentChange,
  searchValue,
  segment,
}: LogsSearchHeaderProps) {
  return (
    <View style={styles.container}>
      <GuardBackHeader title="Visitor Logs" />

      <View style={styles.searchRow}>
        <SymbolView
          name={{ ios: "magnifyingglass", android: "search", web: "search" }}
          size={16}
          tintColor={G.textMuted}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Search visitor..."
          placeholderTextColor={G.textMuted}
          selectionColor={G.teal}
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
            <SymbolView
              name={{ ios: "xmark.circle.fill", android: "close", web: "close" }}
              size={18}
              tintColor={G.textMuted}
            />
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
              name={{ ios: "slider.horizontal.3", android: "tune", web: "tune" }}
              size={17}
              tintColor={G.text}
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
          <SegmentTabs compact options={SEGMENT_OPTIONS} value={segment} onChange={onSegmentChange} />

          {segment !== "expected" ? (
            <Pressable accessibilityRole="button" style={styles.dateRow} onPress={onDatePress}>
              <SymbolView
                name={{ ios: "calendar", android: "calendar_today", web: "calendar_today" }}
                size={14}
                tintColor={G.teal}
              />
              <Text style={styles.dateLabel}>{getDateRangeLabel(datePreset)}</Text>
              <SymbolView
                name={{ ios: "chevron.down", android: "expand_more", web: "expand_more" }}
                size={14}
                tintColor={G.teal}
              />
            </Pressable>
          ) : (
            <Text style={styles.expectedHint}>Approved visitors expected today</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  dateLabel: {
    color: G.teal,
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
    backgroundColor: G.teal,
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
