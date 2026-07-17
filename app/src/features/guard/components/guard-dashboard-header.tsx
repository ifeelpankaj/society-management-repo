import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { AnnouncementBanner } from "@/components/ui/announcement-banner";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useGuardSociety } from "@/features/guard/guard-context";
import { guardLogsRoute } from "@/features/guard/guard-routes";
import { theme } from "@/lib/theme";

type GuardDashboardHeaderProps = {
  isLive: boolean;
  pendingCount: number;
  societyName: string;
};

export function GuardDashboardHeader({
  isLive,
  pendingCount,
  societyName,
}: GuardDashboardHeaderProps) {
  const router = useRouter();
  const { user } = useGuardSociety();
  const displayName = user?.full_name ?? user?.first_name ?? "Guard";

  return (
    <View className="gap-5">
      <View className="flex-row items-center justify-between">
        <UserAvatar
          imageUrl={user?.avatar_url}
          name={displayName}
          onPress={() => router.push("/guard/profile" as Href)}
        />

        <View className="flex-row items-center gap-5">
          <Pressable
            accessibilityLabel={
              pendingCount > 0
                ? `${pendingCount} pending notifications`
                : "Notifications"
            }
            accessibilityRole="button"
            className="relative h-10 w-10 items-center justify-center"
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            onPress={() => router.push("/guard/pending" as Href)}
          >
            <SymbolView
              name={{ ios: "bell", android: "notifications_none", web: "notifications_none" }}
              size={22}
              tintColor={theme.guard.text}
            />
            {pendingCount > 0 ? (
              <View
                className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{ backgroundColor: theme.status.error }}
              />
            ) : null}
          </Pressable>

          <Pressable
            accessibilityLabel="Search visitor logs"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center"
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            onPress={() => router.push(guardLogsRoute("all"))}
          >
            <SymbolView
              name={{ ios: "magnifyingglass", android: "search", web: "search" }}
              size={22}
              tintColor={theme.guard.text}
            />
          </Pressable>
        </View>
      </View>

      <View className="gap-1.5">
        <Text
          className="text-[26px] font-bold tracking-tight"
          numberOfLines={2}
          style={{ color: theme.guard.text, letterSpacing: -0.5 }}
        >
          {societyName}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-[14px] font-medium" style={{ color: theme.guard.textMuted }}>
            Guard Desk
          </Text>
          <Text style={{ color: theme.guard.textMuted }}>•</Text>
          <View className="flex-row items-center gap-1.5">
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: isLive ? theme.status.success : theme.guard.textMuted }}
            />
            <Text
              className="text-[13px] font-semibold"
              style={{ color: isLive ? theme.status.success : theme.guard.textMuted }}
            >
              Live
            </Text>
          </View>
        </View>
      </View>

      <AnnouncementBanner />
    </View>
  );
}
