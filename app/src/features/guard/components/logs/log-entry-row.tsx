import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  formatActivityTimestamp,
  formatDateOnly,
  formatTimeOfDay,
  getFlatLabel,
  getVisitorName,
  getVisitorStatusMeta,
  titleize,
} from "@/features/guard/guard-utils";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { theme } from "@/theme";

const G = theme.guard;

type LogEntryRowProps = {
  entry: ModelsVisitorEntry;
  isCheckingOut?: boolean;
  onCheckOut?: () => void;
  onPress?: () => void;
};

export function LogEntryRow({ entry, isCheckingOut, onCheckOut, onPress }: LogEntryRowProps) {
  const statusMeta = getVisitorStatusMeta(entry.status);
  const timestamp = formatActivityTimestamp(
    entry.checked_out_at ?? entry.checked_in_at ?? entry.updated_at ?? entry.created_at,
  );
  const purpose = entry.purpose ? titleize(entry.purpose) : "Visitor";
  const checkedInDate = formatDateOnly(entry.checked_in_at);
  const checkedInTime = formatTimeOfDay(entry.checked_in_at);

  const mainContent = (
    <View style={styles.main}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>{getVisitorName(entry)}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
          ]}
        >
          <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {purpose} - {getFlatLabel(entry)}
      </Text>

      {entry.checked_in_at ? (
        <View style={styles.checkInMeta}>
          {checkedInDate ? (
            <View style={styles.checkInPill}>
              <Text style={styles.checkInLabel}>Check-in date</Text>
              <Text style={styles.checkInValue}>{checkedInDate}</Text>
            </View>
          ) : null}
          {checkedInTime ? (
            <View style={styles.checkInPill}>
              <Text style={styles.checkInLabel}>Time</Text>
              <Text style={styles.checkInValue}>{checkedInTime}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <Text style={styles.time}>{timestamp || "-"}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.row}>
      {onPress ? (
        <Pressable accessibilityRole="button" style={styles.mainPressable} onPress={onPress}>
          {mainContent}
        </Pressable>
      ) : (
        mainContent
      )}
      {entry.status === "checked_in" && onCheckOut ? (
        <Pressable
          accessibilityRole="button"
          disabled={isCheckingOut}
          hitSlop={8}
          style={styles.checkoutButton}
          onPress={onCheckOut}
        >
          <Text style={styles.checkoutText}>{isCheckingOut ? "..." : "Check Out"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LogEntryDivider() {
  return <View style={{ backgroundColor: theme.border.default, height: 1 }} />;
}

const styles = StyleSheet.create({
  checkoutButton: {
    alignSelf: "center",
    borderColor: G.teal,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkoutText: {
    color: G.teal,
    fontSize: 12,
    fontWeight: "700",
  },
  checkInLabel: {
    color: G.textMuted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  checkInMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  checkInPill: {
    backgroundColor: theme.surface.secondary,
    borderColor: theme.border.input,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  checkInValue: {
    color: G.text,
    fontSize: 12,
    fontWeight: "700",
  },
  main: {
    flex: 1,
    gap: 4,
  },
  mainPressable: {
    flex: 1,
  },
  meta: {
    color: G.textMuted,
    fontSize: 13,
  },
  name: {
    color: G.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    paddingVertical: 14,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  time: {
    color: G.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
});
