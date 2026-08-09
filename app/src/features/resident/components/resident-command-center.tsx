import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Stack } from "@/components/layout";
import {
  DashboardActionRow,
  DashboardActivityFeed,
  DashboardAlertBar,
  DashboardAnnouncement,
  DashboardErrorBanner,
  DashboardHeader,
  DashboardHeroCard,
  DashboardOverviewGrid,
  DashboardSection,
  DashboardSkeleton,
  SubscriptionExpiredBanner,
  getTimeGreeting,
  type DashboardActionTileConfig,
  type DashboardOverviewStatConfig,
} from "@/components/dashboard";
import { VisitorDetailSheet } from "@/features/visitors/components/visitor-detail-sheet";
import { ResidentScreenShell } from "@/features/resident/components/resident-screen-shell";
import { useResidentActivityFeed } from "@/features/resident/hooks/use-resident-activity-feed";
import { useResidentDashboard } from "@/features/resident/hooks/use-resident-dashboard";
import { useResidentFeedback } from "@/features/resident/hooks/use-resident-feedback";
import { useResident } from "@/features/resident/resident-context";
import {
  residentEntriesRoute,
  residentMembersRoute,
  residentProfileRoute,
  residentVisitorInviteRoute,
  residentVisitorSettingsRoute,
  residentVisitorsRoute,
} from "@/features/resident/resident-routes";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";

export function ResidentCommandCenter() {
  const router = useRouter();
  const { user } = useResident();
  const feedback = useResidentFeedback();
  const activityFeed = useResidentActivityFeed();
  const dashboard = useResidentDashboard();
  const { refetchAll } = dashboard;
  const [detailEntry, setDetailEntry] = useState<ModelsVisitorEntry | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const goApprovals = () => router.push(residentVisitorsRoute());
  const goEntries = (preset?: "expected" | "recent") =>
    router.push(residentEntriesRoute(preset ?? "today"));
  const goProfile = () => router.push(residentProfileRoute());

  const handleRefresh = useCallback(() => {
    refetchAll();
    void activityFeed.refresh();
  }, [activityFeed, refetchAll]);

  const openEntryDetail = useCallback((entry: ModelsVisitorEntry) => {
    setDetailEntry(entry);
    setDetailVisible(true);
  }, []);

  const goInvite = useCallback(() => {
    if (!dashboard.canManageFlatVisitors) {
      feedback.showInfo(
        "Permission required",
        "Only active flat residents with visitor access can invite guests.",
      );
      return;
    }
    router.push(residentVisitorInviteRoute());
  }, [dashboard.canManageFlatVisitors, feedback, router]);

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
        id: "members",
        title: "Flat Members",
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
        title: "View History",
        subtitle: "Recent visitor activity",
        tone: "neutral",
        icon: { ios: "clock", android: "history", web: "history" },
        onPress: () => goEntries(),
      },
    ];

    return tiles;
  }, [goEntries, router]);

  const overviewStats = useMemo<DashboardOverviewStatConfig[]>(
    () => [
      {
        id: "pending",
        label: "Pending Approval",
        subtext: "Awaiting your action",
        value: dashboard.pendingCount,
        tone: "orange",
        icon: { ios: "hourglass", android: "hourglass_top", web: "hourglass_top" },
      },
      {
        id: "expected",
        label: "Expected Today",
        subtext: "Expected today",
        value: dashboard.expectedCount,
        tone: "blue",
        icon: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
      },
      {
        id: "visitors",
        label: "Recent Visitors",
        subtext: "Recently visited",
        value: dashboard.visitorsCount,
        tone: "green",
        icon: { ios: "person.2.fill", android: "groups", web: "groups" },
      },
      {
        id: "members",
        label: "Flat Members",
        subtext: "In your flat",
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
                    notificationCount:
                      dashboard.pendingCount > 0 ? dashboard.pendingCount : undefined,
                    onPress: goApprovals,
                  },
                ]}
                greeting={getTimeGreeting(user?.full_name ?? dashboard.displayName)}
                profileAvatar={{
                  imageUrl: user?.avatar_url,
                  name: user?.full_name ?? dashboard.displayName,
                  onPress: goProfile,
                  showOnlineDot: true,
                }}
                statusItems={[
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
              <DashboardErrorBanner
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
                <Stack gap="md">
                  <DashboardHeroCard
                    icon={{
                      ios: "person.badge.plus",
                      android: "person_add",
                      web: "person_add",
                    }}
                    subtitle="Pre-approve a guest for entry"
                    title="Invite Visitor"
                    onPress={goInvite}
                  />
                  <DashboardActionRow actions={actions} />
                </Stack>

                <DashboardSection
                  actionLabel="View details >"
                  title="Overview"
                  onAction={() => goEntries()}
                >
                  <DashboardOverviewGrid stats={overviewStats} onStatPress={handleStatPress} />
                </DashboardSection>

                <DashboardActivityFeed
                  emptyAction={{
                    label: "Invite Visitor",
                    onPress: goInvite,
                  }}
                  hasMore={activityFeed.hasMore}
                  isLoading={activityFeed.isLoading}
                  isLoadingMore={activityFeed.isLoadingMore}
                  items={activityFeed.items}
                  onItemPress={openEntryDetail}
                  onLoadMore={() => {
                    void activityFeed.loadMore();
                  }}
                  onViewAll={() => goEntries()}
                />
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
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
});
