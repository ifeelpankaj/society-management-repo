import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Stack } from "@/components/layout";
import {
  DashboardActionGrid,
  DashboardActivityFeed,
  DashboardAlertBar,
  DashboardAnnouncement,
  DashboardHeader,
  DashboardOverviewGrid,
  DashboardSection,
  DashboardSkeleton,
  SubscriptionExpiredBanner,
  type DashboardActionTileConfig,
  type DashboardOverviewStatConfig,
} from "@/components/dashboard";
import { VisitorDetailSheet } from "@/features/guard/components/visitor-detail-sheet";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { ResidentScreenShell } from "@/features/resident/components/resident-screen-shell";
import { useResidentActivityFeed } from "@/features/resident/hooks/use-resident-activity-feed";
import { useResidentDashboard } from "@/features/resident/hooks/use-resident-dashboard";
import { useResidentFeedback } from "@/features/resident/hooks/use-resident-feedback";
import {
  residentEntriesRoute,
  residentMembersRoute,
  residentVisitorInviteRoute,
  residentVisitorSettingsRoute,
  residentVisitorsRoute,
} from "@/features/resident/resident-routes";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const firstName = name.split(" ")[0] ?? name;
  if (hour < 12) {
    return `Good Morning, ${firstName}`;
  }
  if (hour < 17) {
    return `Good Afternoon, ${firstName}`;
  }
  return `Good Evening, ${firstName}`;
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={styles.errorBanner} onPress={onRetry}>
      <Text style={styles.errorBannerMessage}>{message}</Text>
      <Text style={styles.errorBannerAction}>Retry</Text>
    </Pressable>
  );
}

export function ResidentCommandCenter() {
  const router = useRouter();
  const feedback = useResidentFeedback();
  const activityFeed = useResidentActivityFeed();
  const dashboard = useResidentDashboard();
  const { refetchAll } = dashboard;
  const [detailEntry, setDetailEntry] = useState<ModelsVisitorEntry | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const goApprovals = () => router.push(residentVisitorsRoute());
  const goEntries = (preset?: "expected" | "recent") =>
    router.push(residentEntriesRoute(preset ?? "today"));

  const handleRefresh = useCallback(() => {
    refetchAll();
    void activityFeed.refresh();
  }, [activityFeed, refetchAll]);

  const openEntryDetail = useCallback((entry: ModelsVisitorEntry) => {
    setDetailEntry(entry);
    setDetailVisible(true);
  }, []);

  const handleStatPress = useCallback(
    (id: string) => {
      switch (id) {
        case "pending":
          router.push(residentVisitorsRoute());
          break;
        case "expected":
          router.push(residentEntriesRoute("expected"));
          break;
        case "visitors":
          router.push(residentEntriesRoute("recent"));
          break;
        case "members":
          router.push(residentMembersRoute());
          break;
        default:
          break;
      }
    },
    [router],
  );

  const actions = useMemo(() => {
    const tiles: DashboardActionTileConfig[] = [
      {
        id: "invite",
        title: "Invite visitor",
        subtitle: "Pre-approve guest",
        tone: "blue",
        icon: { ios: "person.badge.plus", android: "person_add", web: "person_add" },
        onPress: () => {
          if (!dashboard.canManageFlatVisitors) {
            feedback.showInfo(
              "Permission required",
              "Only active flat residents with visitor access can invite guests.",
            );
            return;
          }
          router.push(residentVisitorInviteRoute());
        },
      },
      {
        id: "members",
        title: "Flat members",
        subtitle: "People in your flat",
        tone: "blue",
        icon: { ios: "person.2.fill", android: "group", web: "group" },
        onPress: () => router.push(residentMembersRoute()),
      },
      {
        id: "settings",
        title: "Settings",
        subtitle: "Visitor rules",
        tone: "purple",
        icon: { ios: "slider.horizontal.3", android: "tune", web: "tune" },
        onPress: () => router.push(residentVisitorSettingsRoute()),
      },
      {
        id: "entries",
        title: "Entries",
        subtitle: "View history",
        tone: "neutral",
        icon: { ios: "list.bullet.rectangle", android: "list_alt", web: "list_alt" },
        onPress: () => goEntries(),
      },
    ];

    return tiles;
  }, [dashboard.canManageFlatVisitors, feedback, goEntries, router]);

  const overviewStats = useMemo<DashboardOverviewStatConfig[]>(
    () => [
      {
        id: "pending",
        label: "Pending Approval",
        value: dashboard.pendingCount,
        tone: "orange",
        icon: { ios: "hourglass", android: "hourglass_top", web: "hourglass_top" },
      },
      {
        id: "expected",
        label: "Expected Today",
        value: dashboard.expectedCount,
        tone: "blue",
        icon: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
      },
      {
        id: "visitors",
        label: "Recent Visitors",
        value: dashboard.visitorsCount,
        tone: "green",
        icon: { ios: "person.2.fill", android: "groups", web: "groups" },
      },
      {
        id: "members",
        label: "Flat Members",
        value: dashboard.membersCount,
        tone: "neutral",
        icon: { ios: "person.2.fill", android: "group", web: "group" },
      },
    ],
    [
      dashboard.expectedCount,
      dashboard.membersCount,
      dashboard.pendingCount,
      dashboard.visitorsCount,
    ],
  );

  return (
    <View style={styles.screen}>
      <ResidentScreenShell
        backgroundColor={colors.guard.screenBg}
        contentPaddingBottom={layout.tabBarHeight + spacing.lg}
        onRefresh={handleRefresh}
        refreshing={dashboard.isRefreshing || activityFeed.isRefreshing}
      >
        {dashboard.isInitialLoading ? (
          <DashboardSkeleton />
        ) : (
          <Stack gap="2xl">
            <Stack gap="lg">
              <DashboardHeader
                actions={[
                  {
                    accessibilityLabel:
                      dashboard.pendingCount > 0
                        ? `${dashboard.pendingCount} visitors awaiting approval`
                        : "Visitor approvals",
                    icon: { ios: "bell", android: "notifications_none", web: "notifications_none" },
                    onPress: goApprovals,
                    showBadge: dashboard.pendingCount > 0,
                  },
                ]}
                greeting={getGreeting(dashboard.displayName)}
                statusItems={[
                  { label: "Resident" },
                  {
                    label: dashboard.isSubscriptionBlocked ? "Limited" : "Live",
                    live: !dashboard.hasError && !dashboard.isSubscriptionBlocked,
                  },
                ]}
                title={dashboard.flatLabel}
              />
              <DashboardAnnouncement />
            </Stack>

            {dashboard.isSubscriptionBlocked ? <SubscriptionExpiredBanner /> : null}

            {dashboard.hasError ? (
              <ErrorBanner
                message={dashboard.errorMessage ?? "Unable to load data."}
                onRetry={handleRefresh}
              />
            ) : null}

            {dashboard.pendingCount > 0 && !dashboard.isSubscriptionBlocked ? (
              <DashboardAlertBar
                count={dashboard.pendingCount}
                message={`${dashboard.pendingCount} visitor${dashboard.pendingCount === 1 ? "" : "s"} awaiting approval`}
                onPress={goApprovals}
              />
            ) : null}

            {!dashboard.isSubscriptionBlocked ? (
              <>
            <DashboardSection title="Quick Actions">
              <DashboardActionGrid actions={actions} />
            </DashboardSection>

            <DashboardSection title="Overview">
              <DashboardOverviewGrid stats={overviewStats} onStatPress={handleStatPress} />
            </DashboardSection>

            <DashboardActivityFeed
              hasMore={activityFeed.hasMore}
              isLoading={activityFeed.isLoading}
              isLoadingMore={activityFeed.isLoadingMore}
              items={activityFeed.items}
              onLoadMore={() => {
                void activityFeed.loadMore();
              }}
              onViewAll={() => goEntries()}
            />

            {dashboard.pendingEntries.length > 0 ? (
              <DashboardSection actionLabel="View all" title="Pending Approval" onAction={goApprovals}>
                <Stack gap="md">
                  {dashboard.pendingEntries.slice(0, 2).map((entry) => (
                    <VisitorEntryCard
                      key={`home-pending-${entry.id}`}
                      entry={entry}
                      loading={dashboard.isActionLoading}
                      loadingEntryId={dashboard.actionEntryId ?? undefined}
                      primaryActionLabel={dashboard.canManageFlatVisitors ? "Approve" : undefined}
                      secondaryActionLabel={dashboard.canManageFlatVisitors ? "Reject" : undefined}
                      onPress={() => openEntryDetail(entry)}
                      onPrimaryAction={
                        dashboard.canManageFlatVisitors
                          ? () => dashboard.handleApprove(entry.id)
                          : undefined
                      }
                      onSecondaryAction={
                        dashboard.canManageFlatVisitors
                          ? () => dashboard.handleReject(entry.id)
                          : undefined
                      }
                    />
                  ))}
                </Stack>
              </DashboardSection>
            ) : null}
              </>
            ) : null}
          </Stack>
        )}
      </ResidentScreenShell>

      <VisitorDetailSheet
        entry={detailEntry}
        loading={dashboard.isActionLoading}
        primaryActionLabel={
          detailEntry?.status === "waiting_approval" && dashboard.canManageFlatVisitors
            ? "Approve"
            : undefined
        }
        secondaryActionLabel={
          detailEntry?.status === "waiting_approval" && dashboard.canManageFlatVisitors
            ? "Reject"
            : undefined
        }
        visible={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setDetailEntry(null);
        }}
        onPrimaryAction={
          detailEntry?.status === "waiting_approval"
            ? () => void dashboard.handleApprove(detailEntry.id)
            : undefined
        }
        onSecondaryAction={
          detailEntry?.status === "waiting_approval"
            ? () => void dashboard.handleReject(detailEntry.id)
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.status.errorSoft,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorBannerAction: {
    color: colors.status.error,
    fontSize: 13,
    fontWeight: "600",
  },
  errorBannerMessage: {
    color: colors.status.error,
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    paddingRight: spacing.md,
  },
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
});
