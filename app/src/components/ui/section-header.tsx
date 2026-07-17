import { Pressable, Text, View } from "react-native";

import { theme } from "@/lib/theme";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  trailing?: string;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  trailing,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1 gap-1">
        <Text
          className="text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ color: theme.text.muted }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-sm" style={{ color: theme.text.secondary }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <Text className="text-sm font-bold" style={{ color: theme.operational.primary }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
      {trailing ? (
        <Text className="text-sm font-bold" style={{ color: theme.operational.primary }}>
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}
