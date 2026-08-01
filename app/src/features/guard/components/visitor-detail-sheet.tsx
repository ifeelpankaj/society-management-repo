import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Row, Stack } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  formatDateTime,
  getFlatLabel,
  getVisitorName,
  getWaitingDuration,
  titleize,
} from "@/features/guard/guard-utils";
import type { ModelsVisitorEntry, ModelsVisitorPendingEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

type VisitorDetailSheetProps = {
  entry?: ModelsVisitorEntry | ModelsVisitorPendingEntry | null;
  onClose: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  visible: boolean;
  loading?: boolean;
};

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function waitingToneColor(tone: "success" | "warning" | "error") {
  switch (tone) {
    case "warning":
      return colors.status.warning;
    case "error":
      return colors.status.error;
    default:
      return colors.status.success;
  }
}

export function VisitorDetailSheet({
  entry,
  loading,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  visible,
}: VisitorDetailSheetProps) {
  if (!entry) {
    return null;
  }

  const waiting = getWaitingDuration(entry.approved_at);
  const onBehalf = entry.metadata?.approved_on_behalf === true;

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Visitor Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getVisitorName(entry).slice(0, 1).toUpperCase()}</Text>
            </View>
            <Stack gap={6}>
              <Text style={styles.visitorName}>{getVisitorName(entry)}</Text>
              <Text style={styles.heroMeta}>
                {getFlatLabel(entry)} · {titleize(entry.purpose)}
              </Text>
              <Row align="center" gap="sm">
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{titleize(entry.status)}</Text>
                </View>
                {entry.status === "approved" ? (
                  <View style={[styles.waitPill, { borderColor: waitingToneColor(waiting.tone) }]}>
                    <Text style={[styles.waitPillText, { color: waitingToneColor(waiting.tone) }]}>
                      {waiting.label}
                    </Text>
                  </View>
                ) : null}
              </Row>
            </Stack>
          </View>

          <View style={styles.section}>
            <DetailRow label="Phone" value={entry.visitor?.phone_number} />
            <DetailRow label="Email" value={entry.visitor?.email} />
            <DetailRow label="Companions" value={entry.companions_count} />
            <DetailRow label="Delivery partner" value={entry.delivery_partner} />
            <DetailRow label="Service provider" value={entry.service_provider} />
            <DetailRow label="Vehicle" value={entry.vehicle_number} />
            <DetailRow label="Vehicle type" value={entry.vehicle_type ? titleize(entry.vehicle_type) : undefined} />
            <DetailRow label="Created" value={entry.created_at ? formatDateTime(entry.created_at) : undefined} />
            <DetailRow label="Approved" value={entry.approved_at ? formatDateTime(entry.approved_at) : undefined} />
            <DetailRow
              label="Expected checkout"
              value={entry.expected_checkout_at ? formatDateTime(entry.expected_checkout_at) : undefined}
            />
            {entry.notes ? <DetailRow label="Notes" value={entry.notes} /> : null}
            {onBehalf ? (
              <Text style={styles.auditLine}>
                Approved on behalf of {String(entry.metadata?.on_behalf_of_resident_name ?? "flat owner")}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        {primaryActionLabel || secondaryActionLabel ? (
          <View style={styles.footer}>
            <Row align="center" gap="md">
              {secondaryActionLabel ? (
                <View style={styles.actionSlot}>
                  <Button compact fullWidth title={secondaryActionLabel} variant="secondary" onPress={onSecondaryAction} />
                </View>
              ) : null}
              {primaryActionLabel ? (
                <View style={styles.actionSlot}>
                  <Button compact fullWidth loading={loading} title={primaryActionLabel} onPress={onPrimaryAction} />
                </View>
              ) : null}
            </Row>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionSlot: { flex: 1 },
  auditLine: {
    color: colors.status.warning,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.guard.tealSoft,
    borderRadius: 999,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: {
    color: colors.guard.teal,
    fontSize: 24,
    fontWeight: "700",
  },
  closeText: {
    color: colors.guard.teal,
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  detailLabel: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  detailRow: {
    gap: 4,
    paddingVertical: spacing.sm,
  },
  detailValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    borderTopColor: colors.guard.border,
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.guard.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSpacer: { width: 48 },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  hero: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
  },
  heroMeta: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: "center",
  },
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface.card,
    borderColor: colors.guard.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  statusPill: {
    backgroundColor: colors.guard.tealSoft,
    borderRadius: radius["2xl"],
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  statusPillText: {
    color: colors.guard.teal,
    fontSize: 12,
    fontWeight: "700",
  },
  visitorName: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  waitPill: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  waitPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
