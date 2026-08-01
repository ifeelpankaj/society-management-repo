import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Stack } from "@/components/layout";
import {
  DashboardActionRow,
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
import { GuardScreenShell } from "@/features/guard/components/guard-screen-shell";
import { useGuardActivityFeed } from "@/features/guard/hooks/use-guard-activity-feed";
import { useGuardDashboard } from "@/features/guard/hooks/use-guard-dashboard";
import {
  guardAddEntryRoute,
  guardEntriesRoute,
  guardPendingRoute,
  guardScannerRoute,
  guardWaitingAtGateRoute,
} from "@/features/guard/guard-routes";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good Morning, Guard";
  }
  if (hour < 17) {
    return "Good Afternoon, Guard";
  }
  return "Good Evening, Guard";
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={styles.errorBanner} onPress={onRetry}>
      <Text style={styles.errorBannerMessage}>{message}</Text>
      <Text style={styles.errorBannerAction}>Retry</Text>
    </Pressable>
  );
}

export function GuardCommandCenter() {
  const router = useRouter();
  const activityFeed = useGuardActivityFeed();
  const {
    errorMessage,
    waitingAtGateCount,
    hasError,
    isInitialLoading,
    isRefreshing,
    refetchAll,
    societyName,
    stats,
  } = useGuardDashboard();

  const pendingCount = stats?.pending_approvals ?? 0;
  const insideCount = stats?.visitors_inside ?? 0;
  const totalToday = stats?.today_visitors ?? 0;
  const checkedOutCount = Math.max(0, totalToday - insideCount);

  const goPending = () => router.push(guardPendingRoute());
  const goLogs = () => router.push(guardEntriesRoute("today"));

  const handleRefresh = useCallback(() => {
    refetchAll();
    void activityFeed.refresh();
  }, [activityFeed, refetchAll]);

  const handleStatPress = useCallback(
    (id: string) => {
      switch (id) {
        case "inside":
          router.push(guardEntriesRoute("inside"));
          break;
        case "pending":
          router.push(guardPendingRoute());
          break;
        case "waiting-at-gate":
          router.push(guardWaitingAtGateRoute());
          break;
        case "checked-out":
          router.push(guardEntriesRoute("checked_out"));
          break;
        default:
          break;
      }
    },
    [router],
  );

  const actions = useMemo<DashboardActionTileConfig[]>(
    () => [
      {
        id: "scan",
        title: "Scan QR",
        subtitle: "Scan Visitor",
        tone: "orange",
        icon: { ios: "qrcode.viewfinder", android: "qr_code_scanner", web: "qr_code_scanner" },
        onPress: () => router.push(guardScannerRoute()),
      },
      {
        id: "entry",
        title: "New Entry",
        subtitle: "Add Visitor",
        tone: "blue",
        icon: { ios: "person.badge.plus", android: "person_add", web: "person_add" },
        onPress: () => router.push(guardAddEntryRoute()),
      },
      {
        id: "waiting-at-gate",
        title: "At Gate",
        subtitle: "Check In",
        tone: "purple",
        icon: { ios: "door.left.hand.open", android: "meeting_room", web: "meeting_room" },
        onPress: () => router.push(guardWaitingAtGateRoute()),
      },
      {
        id: "logs",
        title: "Logs",
        subtitle: "View History",
        tone: "neutral",
        icon: { ios: "list.bullet.rectangle", android: "list_alt", web: "list_alt" },
        onPress: () => router.push(guardEntriesRoute("today")),
      },
    ],
    [router],
  );

  const overviewStats = useMemo<DashboardOverviewStatConfig[]>(
    () => [
      {
        id: "inside",
        label: "Inside Visitors",
        value: insideCount,
        tone: "green",
        icon: { ios: "person.2.fill", android: "groups", web: "groups" },
      },
      {
        id: "pending",
        label: "Pending Approval",
        value: pendingCount,
        tone: "orange",
        icon: { ios: "hourglass", android: "hourglass_top", web: "hourglass_top" },
      },
      {
        id: "waiting-at-gate",
        label: "Waiting at Gate",
        value: waitingAtGateCount,
        tone: "blue",
        icon: { ios: "door.left.hand.open", android: "meeting_room", web: "meeting_room" },
      },
      {
        id: "checked-out",
        label: "Checked Out",
        value: checkedOutCount,
        tone: "neutral",
        icon: { ios: "arrow.right.square", android: "logout", web: "logout" },
      },
    ],
    [checkedOutCount, insideCount, pendingCount, waitingAtGateCount],
  );

  return (
    <View style={styles.screen}>
      <GuardScreenShell
        backgroundColor={colors.guard.screenBg}
        contentPaddingBottom={layout.tabBarHeight + spacing.lg}
        onRefresh={handleRefresh}
        refreshing={isRefreshing || activityFeed.isRefreshing}
      >
        {isInitialLoading ? (
          <DashboardSkeleton />
        ) : (
          <Stack gap="2xl">
            <Stack gap="lg">
              <DashboardHeader
                actions={[
                  {
                    accessibilityLabel:
                      pendingCount > 0
                        ? `${pendingCount} pending notifications`
                        : "Notifications",
                    icon: { ios: "bell", android: "notifications_none", web: "notifications_none" },
                    onPress: goPending,
                    showBadge: pendingCount > 0,
                  },
                ]}
                greeting={getGreeting()}
                statusItems={[{ label: "Guard Desk" }, { label: "Live", live: !hasError }]}
                title={societyName}
              />
              <DashboardAnnouncement />
            </Stack>

            {hasError ? (
              <ErrorBanner message={errorMessage ?? "Unable to load data."} onRetry={handleRefresh} />
            ) : null}

            {pendingCount > 0 ? (
              <DashboardAlertBar count={pendingCount} onPress={goPending} />
            ) : null}

            <DashboardSection title="Quick Actions">
              <DashboardActionRow actions={actions} />
            </DashboardSection>

            <DashboardSection title="Visitor Overview">
              <DashboardOverviewGrid stats={overviewStats} onStatPress={handleStatPress} />
            </DashboardSection>

            <DashboardActivityFeed
              hasMore={activityFeed.hasMore}
              isLoading={activityFeed.isLoading}
              isLoadingMore={activityFeed.isLoadingMore}
              items={activityFeed.items}
              showFlat
              onLoadMore={() => {
                void activityFeed.loadMore();
              }}
              onViewAll={goLogs}
            />
          </Stack>
        )}
      </GuardScreenShell>
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
