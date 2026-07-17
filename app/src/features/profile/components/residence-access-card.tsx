import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { Card, StatusPill } from "@/components/ui";
import { titleize } from "@/features/guard/guard-utils";
import { theme } from "@/lib/theme";

type ResidenceAccessCardProps = {
  flatLabel: string;
  isPrimary?: boolean;
  onSwitchPress?: () => void;
  residenceCount: number;
  societyName: string;
  status?: string | null;
};

export function ResidenceAccessCard({
  flatLabel,
  isPrimary,
  onSwitchPress,
  residenceCount,
  societyName,
  status,
}: ResidenceAccessCardProps) {
  const roleLabel = isPrimary ? "Primary resident" : "Resident";
  const statusLabel = status ? titleize(status) : "Active";

  return (
    <Card className="gap-3">
      <View className="flex-row items-start gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.guard.tealSoft }}
        >
          <SymbolView
            name={{ ios: "house.fill", android: "home", web: "home" }}
            size={20}
            tintColor={theme.guard.teal}
          />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-lg font-bold" style={{ color: theme.text.primary }}>
            {societyName}
          </Text>
          <Text className="text-sm" style={{ color: theme.text.secondary }}>
            {flatLabel} • {roleLabel} • {statusLabel}
          </Text>
        </View>
        {status ? <StatusPill status={status} /> : null}
      </View>

      {residenceCount > 1 && onSwitchPress ? (
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-between rounded-xl px-3 py-2.5 active:opacity-85"
          style={{ backgroundColor: theme.guard.tealSoft }}
          onPress={onSwitchPress}
        >
          <Text className="text-sm font-semibold" style={{ color: theme.guard.teal }}>
            Switch flat
          </Text>
          <SymbolView
            name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
            size={14}
            tintColor={theme.guard.teal}
          />
        </Pressable>
      ) : null}
    </Card>
  );
}
