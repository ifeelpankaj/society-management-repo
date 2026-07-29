import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading your workspace" }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.brand.orange} size="large" />
      <AppText variant="body" color="secondary" style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface.screen,
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
  },
  message: {
    textAlign: "center",
  },
});
