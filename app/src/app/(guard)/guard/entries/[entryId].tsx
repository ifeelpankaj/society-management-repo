import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Row, Stack } from "@/components/layout";
import { Button, Card, EmptyState, LoadingState } from "@/components/ui";
import { GuardSubScreen } from "@/features/guard/components/guard-sub-screen";
import {
  formatDateOnly,
  formatDateTime,
  formatTimeOfDay,
  getFlatLabel,
  getVisitorName,
  getVisitorStatusMeta,
  titleize,
} from "@/features/guard/guard-utils";
import { useGuardActions } from "@/features/guard/hooks/use-guard-actions";
import { useGuardFeedback } from "@/features/guard/hooks/use-guard-feedback";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { useGetV1SocietiesBySocietyIdVisitorEntriesAndEntryIdQuery } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

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

export default function GuardEntryDetailRoute() {
  const { entryId: entryIdParam } = useLocalSearchParams<{ entryId?: string | string[] }>();
  const entryId = Number(firstParam(entryIdParam));
  const { selectedSocietyId } = useGuardScreen();
  const actions = useGuardActions(selectedSocietyId ?? 0);
  const feedback = useGuardFeedback();

  const query = useGetV1SocietiesBySocietyIdVisitorEntriesAndEntryIdQuery(
    { societyId: selectedSocietyId ?? 0, entryId },
    { skip: !selectedSocietyId || !Number.isFinite(entryId) || entryId <= 0 },
  );

  const entry = query.data?.data?.entry;
  const statusMeta = getVisitorStatusMeta(entry?.status);

  const handleCheckOut = async () => {
    if (!entry?.id) {
      return;
    }

    const result = await actions.checkOutEntry(entry.id);
    feedback.showActionResult(result, {
      successTitle: "Checked out",
      errorTitle: "Checkout failed",
    });

    if (result.success) {
      void query.refetch();
    }
  };

  return (
    <GuardSubScreen title="Visitor Details">
      {query.isLoading ? (
        <LoadingState message="Loading visitor details" />
      ) : !entry ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            actionLabel="Retry"
            message="This visitor entry could not be loaded."
            title="Entry not found"
            onAction={() => void query.refetch()}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getVisitorName(entry).slice(0, 1).toUpperCase()}</Text>
            </View>
            <Stack gap="sm" style={styles.heroCopy}>
              <Text style={styles.name}>{getVisitorName(entry)}</Text>
              <Text style={styles.subtitle}>
                {titleize(entry.purpose)} visiting {getFlatLabel(entry)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
                ]}
              >
                <Text style={[styles.statusText, { color: statusMeta.color }]}>
                  {statusMeta.label}
                </Text>
              </View>
            </Stack>
          </Card>

          {entry.checked_in_at ? (
            <Row align="stretch" gap="md">
              <Card style={styles.timeCard}>
                <Text style={styles.timeLabel}>Check-in date</Text>
                <Text style={styles.timeValue}>{formatDateOnly(entry.checked_in_at)}</Text>
              </Card>
              <Card style={styles.timeCard}>
                <Text style={styles.timeLabel}>Check-in time</Text>
                <Text style={styles.timeValue}>{formatTimeOfDay(entry.checked_in_at)}</Text>
              </Card>
            </Row>
          ) : null}

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Visit</Text>
            <DetailRow label="Flat" value={getFlatLabel(entry)} />
            <DetailRow label="Purpose" value={titleize(entry.purpose)} />
            <DetailRow label="Expected" value={entry.expected_at ? formatDateTime(entry.expected_at) : undefined} />
            <DetailRow label="Approved" value={entry.approved_at ? formatDateTime(entry.approved_at) : undefined} />
            <DetailRow label="Checked out" value={entry.checked_out_at ? formatDateTime(entry.checked_out_at) : undefined} />
            <DetailRow
              label="Expected checkout"
              value={entry.expected_checkout_at ? formatDateTime(entry.expected_checkout_at) : undefined}
            />
            <DetailRow label="Created" value={entry.created_at ? formatDateTime(entry.created_at) : undefined} />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Visitor</Text>
            <DetailRow label="Phone" value={entry.visitor?.phone_number} />
            <DetailRow label="Email" value={entry.visitor?.email} />
            <DetailRow label="Companions" value={entry.companions_count} />
            <DetailRow label="Vehicle" value={entry.vehicle_number} />
            <DetailRow label="Vehicle type" value={entry.vehicle_type ? titleize(entry.vehicle_type) : undefined} />
            <DetailRow label="Delivery partner" value={entry.delivery_partner} />
            <DetailRow label="Service provider" value={entry.service_provider} />
            <DetailRow label="Notes" value={entry.notes} />
          </Card>

          {entry.status === "checked_in" ? (
            <Button
              loading={actions.activeEntryId === entry.id}
              title="Check Out"
              onPress={() => void handleCheckOut()}
            />
          ) : null}
        </ScrollView>
      )}
    </GuardSubScreen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.guard.tealSoft,
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: colors.guard.teal,
    fontSize: 28,
    fontWeight: "800",
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  detailLabel: {
    color: colors.guard.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  detailRow: {
    gap: 4,
    paddingVertical: spacing.sm,
  },
  detailValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  emptyWrap: {
    padding: spacing.lg,
  },
  hero: {
    alignItems: "center",
    backgroundColor: colors.surface.secondary,
    borderColor: colors.border.input,
    gap: spacing.md,
  },
  heroCopy: {
    alignItems: "center",
  },
  name: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "800",
  },
  statusBadge: {
    alignSelf: "center",
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: "center",
  },
  timeCard: {
    backgroundColor: colors.surface.input,
    borderColor: colors.border.input,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  timeLabel: {
    color: colors.guard.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  timeValue: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "800",
  },
});
