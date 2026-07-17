import { Text, View } from "react-native";

import { theme } from "@/lib/theme";

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps) {
  return (
    <View className="gap-2">
      {eyebrow ? (
        <Text
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: theme.brand.orange }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text className="text-3xl font-bold" style={{ color: theme.text.primary }}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-base leading-6" style={{ color: theme.text.secondary }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
