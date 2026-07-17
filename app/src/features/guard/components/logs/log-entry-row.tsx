import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  formatTimeOfDay,
  getFlatLabel,
  getVisitorName,
  titleize,
} from "@/features/guard/guard-utils";
import type { ModelsVisitorEntry, ModelsVisitorStatus } from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

const G = theme.guard;

type LogEntryRowProps = {
  entry: ModelsVisitorEntry;
  isCheckingOut?: boolean;
  onCheckOut?: () => void;
};

function getSoftStatusMeta(status?: ModelsVisitorStatus) {
  switch (status) {
    case "waiting_approval":
      return {
        bg: theme.status.warningSoft,
        border: "#fde68a",
        color: "#92400e",
        label: "Pending",
      };
    case "approved":
      return {
        bg: theme.status.successSoft,
        border: "#bbf7d0",
        color: "#166534",
        label: "Approved",
      };
    case "checked_in":
      return {
        bg: theme.status.successSoft,
        border: "#bbf7d0",
        color: "#166534",
        label: "Checked In",
      };
    case "checked_out":
      return {
        bg: "#f8fafc",
        border: theme.border.default,
        color: G.textMuted,
        label: "Checked Out",
      };
    case "rejected":
      return {
        bg: theme.status.errorSoft,
        border: "#fecaca",
        color: "#b91c1c",
        label: "Rejected",
      };
    default:
      return {
        bg: "#f8fafc",
        border: theme.border.default,
        color: G.textMuted,
        label: titleize(status),
      };
  }
}

export function LogEntryRow({ entry, isCheckingOut, onCheckOut }: LogEntryRowProps) {
  const statusMeta = getSoftStatusMeta(entry.status);
  const time = formatTimeOfDay(
    entry.checked_out_at ?? entry.checked_in_at ?? entry.updated_at ?? entry.created_at,
  );
  const purpose = entry.purpose ? titleize(entry.purpose) : "Visitor";

  return (
    <View style={styles.row}>
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
          {purpose} • {getFlatLabel(entry)}
        </Text>

        <Text style={styles.time}>{time || "—"}</Text>
      </View>

      {entry.status === "checked_in" && onCheckOut ? (
        <Pressable
          accessibilityRole="button"
          disabled={isCheckingOut}
          hitSlop={8}
          style={styles.checkoutButton}
          onPress={onCheckOut}
        >
          <Text style={styles.checkoutText}>
            {isCheckingOut ? "..." : "Check Out"}
          </Text>
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
  main: {
    flex: 1,
    gap: 4,
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
