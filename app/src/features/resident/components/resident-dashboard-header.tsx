import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { UserAvatar } from "@/components/ui";
import { useResident } from "@/features/resident/resident-context";
import { residentProfileRoute, residentVisitorsRoute } from "@/features/resident/resident-routes";
import { theme } from "@/lib/theme";

type ResidentDashboardHeaderProps = {
  displayName: string;
  flatLabel: string;
  pendingCount: number;
};

export function ResidentDashboardHeader({
  displayName,
  flatLabel,
  pendingCount,
}: ResidentDashboardHeaderProps) {
  const router = useRouter();
  const { user } = useResident();

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <UserAvatar
          imageUrl={user?.avatar_url}
          name={displayName}
          onPress={() => router.push(residentProfileRoute())}
        />

        <Pressable
          accessibilityLabel={
            pendingCount > 0
              ? `${pendingCount} visitors awaiting approval`
              : "Visitor approvals"
          }
          accessibilityRole="button"
          className="relative h-10 w-10 items-center justify-center"
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
          onPress={() => router.push(residentVisitorsRoute())}
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
      </View>

      <View className="gap-1">
        <Text
          className="text-[26px] font-bold tracking-tight"
          numberOfLines={2}
          style={{ color: theme.guard.text, letterSpacing: -0.5 }}
        >
          {displayName}
        </Text>
        <Text className="text-[14px] font-medium" style={{ color: theme.guard.textMuted }}>
          {flatLabel}
        </Text>
      </View>
    </View>
  );
}
