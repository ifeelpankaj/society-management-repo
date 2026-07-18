import { useFocusEffect, useRouter, type Href } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";

import { SectionHeader, StatCard } from "@/components/ui";
import { VisitorEntryCard } from "@/features/guard/components/visitor-entry-card";
import { TodayActivityFeed } from "@/features/guard/components/today-activity-feed";
import { ResidentDashboardHeader } from "@/features/resident/components/resident-dashboard-header";
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
import { theme } from "@/lib/theme";

const G = theme.guard;

const QUICK_ACTIONS = [
  {
    id: "approvals",
    label: "Approvals",
    route: residentVisitorsRoute(),
    icon: { ios: "checkmark.seal.fill", android: "verified", web: "verified" },
  },
  {
    id: "invite",
    label: "Invite",
    route: residentVisitorInviteRoute(),
    icon: { ios: "person.badge.plus", android: "person_add", web: "person_add" },
  },
  {
    id: "logs",
    label: "Logs",
    route: residentLogsRoute(),
    icon: { ios: "list.bullet.rectangle", android: "list_alt", web: "list_alt" },
  },
  {
    id: "settings",
    label: "Approval",
    route: residentVisitorSettingsRoute(),
    icon: { ios: "slider.horizontal.3", android: "tune", web: "tune" },
    requiresHybrid: true,
  },
  {
    id: "members",
    label: "Members",
    route: residentMembersAddRoute(),
    icon: { ios: "person.2.fill", android: "group", web: "group" },
    requiresPrimary: true,
  },
] as const;

function Skeleton({ className, style }: { className?: string; style?: ViewStyle }) {
  return (
    <View
      className={className}
      style={[{ backgroundColor: "rgba(226, 232, 240, 0.7)", borderRadius: 8 }, style]}
    />
  );
}

function CommandCenterSkeleton() {
  return (
    <View className="gap-6">
      <View className="gap-4">
        <View className="flex-row justify-between">
          <Skeleton className="h-11 w-11" style={{ borderRadius: 22 }} />
          <Skeleton className="h-6 w-6" style={{ borderRadius: 12 }} />
        </View>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-[72px] w-full" style={{ borderRadius: 18 }} />
      </View>
      <View className="flex-row justify-between px-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-10" style={{ borderRadius: 14 }} />
        ))}
      </View>
      <View className="flex-row flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[88px] min-w-[46%] flex-1" style={{ borderRadius: 18 }} />
        ))}
      </View>
    </View>
  );
}

function PendingBanner({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  if (count <= 0) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel={`${count} visitor awaiting approval`}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-[18px] px-4 py-3.5"
      style={({ pressed }) => ({
        backgroundColor: theme.announcement.bg,
        opacity: pressed ? 0.85 : 1,
      })}
      onPress={onPress}
    >
      <SymbolView
        name={{ ios: "megaphone.fill", android: "campaign", web: "campaign" }}
        size={18}
        tintColor={theme.announcement.text}
      />
      <Text className="flex-1 text-[15px] font-semibold" style={{ color: theme.announcement.text }}>
        {count} visitor{count === 1 ? "" : "s"} awaiting approval
      </Text>
      <SymbolView
        name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
        size={14}
        tintColor={theme.announcement.text}
      />
    </Pressable>
  );
}

function QuickActionsRow({
  canManageFlatMembers,
  isHybrid,
  onNavigate,
}: {
  canManageFlatMembers: boolean;
  isHybrid: boolean;
  onNavigate: (route: Href) => void;
}) {
  const actions = QUICK_ACTIONS.filter((action) => {
    if ("requiresPrimary" in action && action.requiresPrimary && !canManageFlatMembers) {
      return false;
    }
    if ("requiresHybrid" in action && action.requiresHybrid && !isHybrid) {
      return false;
    }
    return true;
  });

  return (
    <View className="gap-4">
      <SectionHeader title="Quick Actions" />
      <View className="flex-row flex-wrap items-start justify-between px-1">
        {actions.map((action) => (
          <Pressable
            key={action.id}
            accessibilityLabel={action.label}
            accessibilityRole="button"
            className="mb-2 min-w-[20%] flex-1 items-center gap-2.5"
            style={({ pressed }) => ({
              opacity: pressed ? 0.65 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
            onPress={() => onNavigate(action.route)}
          >
            <SymbolView name={action.icon} size={28} tintColor={G.teal} />
            <Text
              className="text-center text-[11px] font-medium"
              numberOfLines={1}
              style={{ color: G.textMuted }}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function OverviewGrid({
  expectedCount,
  membersCount,
  pendingCount,
  visitorsCount,
}: {
  expectedCount: number;
  membersCount: number;
  pendingCount: number;
  visitorsCount: number;
}) {
  return (
    <View className="gap-4">
      <SectionHeader title="Overview" />
      <View className="flex-row flex-wrap gap-3">
        <StatCard label="Pending" tone="warning" value={pendingCount} />
        <StatCard label="Expected" tone="success" value={expectedCount} />
        <StatCard label="Visitors" tone="teal" value={visitorsCount} />
        <StatCard label="Members" value={membersCount} />
      </View>
    </View>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center justify-between rounded-[14px] px-4 py-3"
      style={{ backgroundColor: theme.status.errorSoft }}
      onPress={onRetry}
    >
      <Text className="flex-1 pr-3 text-[13px] font-medium" style={{ color: "#991b1b" }}>
        {message}
      </Text>
      <Text className="text-[13px] font-semibold" style={{ color: "#b91c1c" }}>
        Retry
      </Text>
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

  useFocusEffect(
    useCallback(() => {
      if (dashboard.isReady) {
        refetchAll();
      }
    }, [dashboard.isReady, refetchAll]),
  );

  return (
    <View className="flex-1" style={{ backgroundColor: G.screenBg }}>
      <ResidentScreenShell
        backgroundColor={G.screenBg}
        contentPaddingBottom={24}
        onRefresh={handleRefresh}
        refreshing={dashboard.isRefreshing || activityFeed.isRefreshing}
      >
        {dashboard.isInitialLoading ? (
          <CommandCenterSkeleton />
        ) : (
          <View className="gap-6">
            <ResidentDashboardHeader
              displayName={dashboard.displayName}
              flatLabel={dashboard.flatLabel}
              pendingCount={dashboard.pendingCount}
            />

            {dashboard.hasError ? (
              <ErrorBanner
                message={dashboard.errorMessage ?? "Unable to load data."}
                onRetry={handleRefresh}
              />
            ) : null}

            <PendingBanner count={dashboard.pendingCount} onPress={goApprovals} />

            <QuickActionsRow
              canManageFlatMembers={dashboard.canManageFlatMembers}
              isHybrid={dashboard.isHybrid}
              onNavigate={(route) => router.push(route)}
            />

            <OverviewGrid
              expectedCount={dashboard.expectedCount}
              membersCount={dashboard.membersCount}
              pendingCount={dashboard.pendingCount}
              visitorsCount={dashboard.visitorsCount}
            />

            <TodayActivityFeed
              hasMore={activityFeed.hasMore}
              isLoading={activityFeed.isLoading}
              isLoadingMore={activityFeed.isLoadingMore}
              items={activityFeed.items}
              title="Recent Activity"
              onLoadMore={() => {
                void activityFeed.loadMore();
              }}
              onViewAll={goLogs}
            />

            {dashboard.pendingEntries.length > 0 ? (
              <View className="gap-3">
                <SectionHeader
                  actionLabel="View all"
                  title="Pending Approval"
                  onAction={goApprovals}
                />
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
              </View>
            ) : null}
          </View>
        )}
      </ResidentScreenShell>
    </View>
  );
}
