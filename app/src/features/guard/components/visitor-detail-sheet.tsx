import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { Row, Stack } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  formatDateOnly,
  formatDateTime,
  formatTimeOfDay,
  getFlatLabel,
  getVisitorName,
  getVisitorStatusMeta,
  getWaitingDuration,
  titleize,
} from "@/features/guard/guard-utils";
import type { ModelsVisitorEntry, ModelsVisitorPendingEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

type VisitorDetailSheetProps = {
  entry?: ModelsVisitorEntry | ModelsVisitorPendingEntry | null;
  loading?: boolean;
  onClose: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  visible: boolean;
};

type DetailItem = {
  icon: { ios: string; android: string; web: string };
  label: string;
  value?: string | number | null;
};

function DetailRow({ icon, label, value }: DetailItem) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconWrap}>
        <SymbolView name={icon} size={16} tintColor={colors.brand.orange} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function DetailSection({ items, title }: { items: DetailItem[]; title: string }) {
  const visibleItems = items.filter(
    (item) => item.value !== undefined && item.value !== null && item.value !== "",
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>
        {visibleItems.map((item, index) => (
          <View key={`${item.label}-${index}`}>
            <DetailRow {...item} />
            {index < visibleItems.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function TimeCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.timeCard}>
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={styles.timeValue}>{value}</Text>
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
  const statusMeta = getVisitorStatusMeta(entry.status);
  const visitorName = getVisitorName(entry);

  const contactItems: DetailItem[] = [
    {
      icon: { ios: "phone.fill", android: "phone", web: "phone" },
      label: "Phone",
      value: entry.visitor?.phone_number,
    },
    {
      icon: { ios: "envelope.fill", android: "email", web: "email" },
      label: "Email",
      value: entry.visitor?.email,
    },
  ];

  const visitItems: DetailItem[] = [
    {
      icon: { ios: "person.2.fill", android: "groups", web: "groups" },
      label: "Companions",
      value: entry.companions_count,
    },
    {
      icon: { ios: "shippingbox.fill", android: "local_shipping", web: "local_shipping" },
      label: "Delivery partner",
      value: entry.delivery_partner,
    },
    {
      icon: { ios: "wrench.and.screwdriver.fill", android: "build", web: "build" },
      label: "Service provider",
      value: entry.service_provider,
    },
    {
      icon: { ios: "car.fill", android: "directions_car", web: "directions_car" },
      label: "Vehicle",
      value: entry.vehicle_number,
    },
    {
      icon: { ios: "car.side.fill", android: "commute", web: "commute" },
      label: "Vehicle type",
      value: entry.vehicle_type ? titleize(entry.vehicle_type) : undefined,
    },
  ];

  const timelineItems: DetailItem[] = [
    {
      icon: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
      label: "Created",
      value: entry.created_at ? formatDateTime(entry.created_at) : undefined,
    },
    {
      icon: { ios: "checkmark.seal.fill", android: "verified", web: "verified" },
      label: "Approved",
      value: entry.approved_at ? formatDateTime(entry.approved_at) : undefined,
    },
    {
      icon: { ios: "arrow.right.to.line", android: "logout", web: "logout" },
      label: "Checkout date",
      value: entry.checked_out_at ? formatDateOnly(entry.checked_out_at) : undefined,
    },
    {
      icon: { ios: "clock.fill", android: "schedule", web: "schedule" },
      label: "Checkout time",
      value: entry.checked_out_at ? formatTimeOfDay(entry.checked_out_at) : undefined,
    },
    {
      icon: { ios: "clock.badge.exclamationmark", android: "schedule", web: "schedule" },
      label: "Expected checkout",
      value: entry.expected_checkout_at ? formatDateTime(entry.expected_checkout_at) : undefined,
    },
  ];

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <AppStatusBar />

        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>Visitor Details</Text>
          <Pressable accessibilityLabel="Close" hitSlop={12} style={styles.headerSide} onPress={onClose}>
            <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={colors.text.secondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{visitorName.slice(0, 1).toUpperCase()}</Text>
              </View>
            </View>

            <Stack gap="xs" style={styles.heroCopy}>
              <Text style={styles.visitorName}>{visitorName}</Text>
              <Text style={styles.heroMeta}>
                {getFlatLabel(entry)} · {titleize(entry.purpose)}
              </Text>
            </Stack>

            <Row align="center" gap="sm" style={styles.badgeRow}>
              <View style={[styles.statusPill, { backgroundColor: statusMeta.bg, borderColor: statusMeta.border }]}>
                <Text style={[styles.statusPillText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
              </View>
              {entry.status === "approved" ? (
                <View style={[styles.waitPill, { borderColor: waitingToneColor(waiting.tone) }]}>
                  <Text style={[styles.waitPillText, { color: waitingToneColor(waiting.tone) }]}>
                    {waiting.label}
                  </Text>
                </View>
              ) : null}
            </Row>
          </View>

          {entry.checked_in_at || entry.checked_out_at ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Visit timeline</Text>
              <Row align="stretch" gap="sm">
                {entry.checked_in_at ? (
                  <>
                    <TimeCard label="Check-in date" value={formatDateOnly(entry.checked_in_at)} />
                    <TimeCard label="Check-in time" value={formatTimeOfDay(entry.checked_in_at)} />
                  </>
                ) : null}
              </Row>
              {entry.checked_out_at ? (
                <Row align="stretch" gap="sm" style={styles.checkoutRow}>
                  <TimeCard label="Checkout date" value={formatDateOnly(entry.checked_out_at)} />
                  <TimeCard label="Checkout time" value={formatTimeOfDay(entry.checked_out_at)} />
                </Row>
              ) : null}
            </View>
          ) : null}

          <DetailSection items={contactItems} title="Contact" />
          <DetailSection items={visitItems} title="Visit info" />
          <DetailSection items={timelineItems} title="Activity" />

          {entry.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{entry.notes}</Text>
            </View>
          ) : null}

          {onBehalf ? (
            <View style={styles.auditBanner}>
              <SymbolView
                name={{ ios: "person.crop.circle.badge.checkmark", android: "verified_user", web: "verified_user" }}
                size={16}
                tintColor={colors.status.warning}
              />
              <Text style={styles.auditLine}>
                Approved on behalf of {String(entry.metadata?.on_behalf_of_resident_name ?? "flat owner")}
              </Text>
            </View>
          ) : null}
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
  actionSlot: {
    flex: 1,
  },
  auditBanner: {
    alignItems: "center",
    backgroundColor: colors.status.warningSoft,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  auditLine: {
    color: colors.status.warning,
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderRadius: 999,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  avatarRing: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: 999,
    padding: 4,
  },
  avatarText: {
    color: colors.brand.orange,
    fontSize: 28,
    fontWeight: "800",
  },
  badgeRow: {
    justifyContent: "center",
  },
  checkoutRow: {
    marginTop: spacing.sm,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing["3xl"],
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
  },
  detailCopy: {
    flex: 1,
    gap: 2,
  },
  detailIconWrap: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: radius.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: "600",
  },
  divider: {
    backgroundColor: colors.border.default,
    height: StyleSheet.hairlineWidth,
    marginLeft: 36 + spacing.md,
  },
  footer: {
    backgroundColor: colors.surface.card,
    borderTopColor: colors.border.default,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.lg,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
    ...shadows.sm,
  },
  header: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderBottomColor: colors.border.default,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSide: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: "700",
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderRadius: radius["2xl"],
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing["2xl"],
    ...shadows.card,
  },
  heroCopy: {
    alignItems: "center",
  },
  heroMeta: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: "center",
  },
  notesCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.xl,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.card,
  },
  notesText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  sectionBody: {
    marginTop: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.eyebrow,
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statusPill: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  timeCard: {
    backgroundColor: colors.dashboard.actionNeutralSoft,
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  timeValue: {
    ...typography.subtitle,
    color: colors.text.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  visitorName: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  waitPill: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  waitPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
