import { useRouter, type Href } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";

import { SectionHeader, StatCard } from "@/components/ui";
import { GuardDashboardHeader } from "@/features/guard/components/guard-dashboard-header";
import { GuardScreenShell } from "@/features/guard/components/guard-screen-shell";
import { ScanFab } from "@/features/guard/components/scan-fab";
import { TodayActivityFeed } from "@/features/guard/components/today-activity-feed";
import { useGuardActivityFeed } from "@/features/guard/hooks/use-guard-activity-feed";
import { useGuardDashboard } from "@/features/guard/hooks/use-guard-dashboard";
import { guardLogsRoute } from "@/features/guard/guard-routes";
import { theme } from "@/lib/theme";

const G = theme.guard;

const QUICK_ACTIONS = [
  {
    id: "scan",
    label: "Scan",
    route: "/guard/scan" as Href,
    icon: { ios: "qrcode.viewfinder", android: "qr_code_scanner", web: "qr_code_scanner" },
  },
  {
    id: "entry",
    label: "Entry",
    route: "/guard/add-entry" as Href,
    icon: { ios: "person.badge.plus", android: "person_add", web: "person_add" },
  },
  {
    id: "expected",
    label: "Expected",
    route: guardLogsRoute("expected"),
    icon: { ios: "checkmark.seal", android: "verified", web: "verified" },
  },
  {
    id: "logs",
    label: "Logs",
    route: guardLogsRoute("all"),
    icon: { ios: "list.bullet.rectangle", android: "list_alt", web: "list_alt" },
  },
] as const;

function panelStyle(): ViewStyle {
  return {
    backgroundColor: theme.surface.card,
    borderRadius: 18,
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
  };
}

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
          <View className="flex-row gap-4">
            <Skeleton className="h-6 w-6" style={{ borderRadius: 12 }} />
            <Skeleton className="h-6 w-6" style={{ borderRadius: 12 }} />
          </View>
        </View>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-[72px] w-full" style={{ borderRadius: 18 }} />
      </View>
      <View className="flex-row justify-between px-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-10" style={{ borderRadius: 14 }} />
        ))}
      </View>
      <View className="flex-row flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[88px] min-w-[46%] flex-1" style={{ borderRadius: 18 }} />
        ))}
      </View>
      <View style={panelStyle()} className="gap-3 p-4">
        <Skeleton className="h-4 w-28" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </View>
    </View>
  );
}

function QuickActionsRow({ onNavigate }: { onNavigate: (route: Href) => void }) {
  return (
    <View className="gap-4">
      <SectionHeader title="Quick Actions" />
      <View className="flex-row items-start justify-between px-1">
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            accessibilityLabel={action.label}
            accessibilityRole="button"
            className="flex-1 items-center gap-2.5"
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

function VisitorOverviewGrid({
  expectedToday,
  insideCount,
  pendingCount,
  totalToday,
}: {
  expectedToday: number;
  insideCount: number;
  pendingCount: number;
  totalToday: number;
}) {
  return (
    <View className="gap-4">
      <SectionHeader title="Visitor Overview" />
      <View className="flex-row flex-wrap gap-3">
        <StatCard label="Inside" tone="teal" value={insideCount} />
        <StatCard label="Total" value={totalToday} />
        <StatCard label="Expected Today" tone="success" value={expectedToday} />
        <StatCard label="Pending Approval" tone="warning" value={pendingCount} />
      </View>
    </View>
  );
}

function PendingAlert({
  count,
  onReview,
}: {
  count: number;
  onReview: () => void;
}) {
  if (count <= 0) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel={`${count} visitors waiting for approval. Review.`}
      accessibilityRole="button"
      className="flex-row items-center justify-between rounded-[14px] px-1 py-1"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      onPress={onReview}
    >
      <View className="flex-1 flex-row items-center gap-2 pr-3">
        <SymbolView
          name={{ ios: "exclamationmark.triangle.fill", android: "warning", web: "warning" }}
          size={16}
          tintColor={theme.status.warning}
        />
        <Text className="flex-1 text-[14px] font-medium" style={{ color: theme.text.secondary }}>
          {count} visitor{count === 1 ? "" : "s"} waiting for approval
        </Text>
      </View>
      <Text className="text-[13px] font-semibold" style={{ color: G.teal }}>
        Review →
      </Text>
    </Pressable>
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

export function GuardCommandCenter() {
  const router = useRouter();
  const activityFeed = useGuardActivityFeed();
  const {
    errorMessage,
    expectedTodayCount,
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

  const goPending = () => router.push("/guard/pending" as Href);
  const goScan = () => router.push("/guard/scan" as Href);
  const goLogs = () => router.push(guardLogsRoute("today"));

  const handleRefresh = useCallback(() => {
    refetchAll();
    void activityFeed.refresh();
  }, [activityFeed, refetchAll]);

  return (
    <View className="flex-1" style={{ backgroundColor: G.screenBg }}>
      <GuardScreenShell
        backgroundColor={G.screenBg}
        contentPaddingBottom={24}
        footer={<ScanFab onPress={goScan} />}
        onRefresh={handleRefresh}
        refreshing={isRefreshing || activityFeed.isRefreshing}
      >
        {isInitialLoading ? (
          <CommandCenterSkeleton />
        ) : (
          <View className="gap-6">
            <GuardDashboardHeader
              isLive={!hasError}
              pendingCount={pendingCount}
              societyName={societyName}
            />

            {hasError ? (
              <ErrorBanner message={errorMessage ?? "Unable to load data."} onRetry={handleRefresh} />
            ) : null}

            <PendingAlert count={pendingCount} onReview={goPending} />

            <QuickActionsRow onNavigate={(route) => router.push(route)} />

            <VisitorOverviewGrid
              expectedToday={expectedTodayCount}
              insideCount={insideCount}
              pendingCount={pendingCount}
              totalToday={totalToday}
            />

            <TodayActivityFeed
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
          </View>
        )}
      </GuardScreenShell>
    </View>
  );
}
