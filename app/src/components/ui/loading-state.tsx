import { ActivityIndicator, Text, View } from "react-native";

import { theme } from "@/lib/theme";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading your workspace" }: LoadingStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center gap-4 px-6"
      style={{ backgroundColor: theme.surface.screen }}
    >
      <ActivityIndicator color={theme.brand.orange} size="large" />
      <Text className="text-center text-base" style={{ color: theme.text.secondary }}>
        {message}
      </Text>
    </View>
  );
}
