import { useRouter, type Href } from "expo-router";
import { useCallback, useMemo } from "react";
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
  type DashboardActionTileConfig,
  type DashboardOverviewStatConfig,
} from "@/components/dashboard";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { ResidentScreenShell } from "@/features/resident/components/resident-screen-shell";
import { useResidentActivityFeed } from "@/features/resident/hooks/use-resident-activity-feed";
import { useResidentDashboard } from "@/features/resident/hooks/use-resident-dashboard";
import {
  residentLogsRoute,
  residentMembersAddRoute,
  residentVisitorInviteRoute,
  residentVisitorSettingsRoute,
  residentVisitorsRoute,
} from "@/features/resident/resident-routes";
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
  const activityFeed = useResidentActivityFeed();
  const dashboard = useResidentDashboard();
  const { refetchAll } = dashboard;

  const goApprovals = () => router.push(residentVisitorsRoute());
  const goLogs = () => router.push(residentLogsRoute());

  const handleRefresh = useCallback(() => {
    refetchAll();
    void activityFeed.refresh();
  }, [activityFeed, refetchAll]);

  const actions = useMemo(() => {
    const all: DashboardActionTileConfig[] = [
      {
        id: "approvals",
        title: "Approvals",
        subtitle: "Review pending",
        tone: "orange",
        icon: { ios: "checkmark.seal.fill", android: "verified", web: "verified" },
        onPress: goApprovals,
      },
      {
        id: "invite",
        title: "Invite",
        subtitle: "Add visitor",
        tone: "blue",
        icon: { ios: "person.badge.plus", android: "person_add", web: "person_add" },
        onPress: () => router.push(residentVisitorInviteRoute()),
      },
      {
        id: "logs",
        title: "Logs",
        subtitle: "View history",
        tone: "neutral",
        icon: { ios: "list.bullet.rectangle", android: "list_alt", web: "list_alt" },
        onPress: goLogs,
      },
    ];

    if (dashboard.isHybrid) {
      all.push({
        id: "settings",
        title: "Approval",
        subtitle: "Flat settings",
        tone: "purple",
        icon: { ios: "slider.horizontal.3", android: "tune", web: "tune" },
        onPress: () => router.push(residentVisitorSettingsRoute()),
      });
    }

    if (dashboard.canManageFlatMembers) {
      all.push({
        id: "members",
        title: "Members",
        subtitle: "Manage flat",
        tone: "blue",
        icon: { ios: "person.2.fill", android: "group", web: "group" },
        onPress: () => router.push(residentMembersAddRoute()),
      });
    }

    return all;
  }, [dashboard.canManageFlatMembers, dashboard.isHybrid, goApprovals, goLogs, router]);

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
                  {
                    accessibilityLabel: "Profile",
                    icon: {
                      ios: "person.crop.circle",
                      android: "account_circle",
                      web: "account_circle",
                    },
                    onPress: () => router.push("/resident/profile" as Href),
                  },
                ]}
                greeting={getGreeting(dashboard.displayName)}
                statusItems={[{ label: "Resident" }, { label: "Live", live: !dashboard.hasError }]}
                title={dashboard.flatLabel}
              />
              <DashboardAnnouncement />
            </Stack>

            {dashboard.hasError ? (
              <ErrorBanner
                message={dashboard.errorMessage ?? "Unable to load data."}
                onRetry={handleRefresh}
              />
            ) : null}

            {dashboard.pendingCount > 0 ? (
              <DashboardAlertBar
                count={dashboard.pendingCount}
                message={`${dashboard.pendingCount} visitor${dashboard.pendingCount === 1 ? "" : "s"} awaiting approval`}
                onPress={goApprovals}
              />
            ) : null}

            <DashboardSection title="Quick Actions">
              <DashboardActionGrid actions={actions} />
            </DashboardSection>

            <DashboardSection title="Overview">
              <DashboardOverviewGrid stats={overviewStats} />
            </DashboardSection>

            <DashboardActivityFeed
              hasMore={activityFeed.hasMore}
              isLoading={activityFeed.isLoading}
              isLoadingMore={activityFeed.isLoadingMore}
              items={activityFeed.items}
              onLoadMore={() => {
                void activityFeed.loadMore();
              }}
              onViewAll={goLogs}
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
          </Stack>
        )}
      </ResidentScreenShell>
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
