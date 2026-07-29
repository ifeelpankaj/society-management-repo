import { StyleSheet, View } from "react-native";

import { Stack } from "@/components/layout";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

import { Button } from "./button";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon} />
      <Stack gap="sm">
        <AppText variant="title" color="primary" style={styles.centered}>
          {title}
        </AppText>
        <AppText variant="body" color="secondary" style={styles.centered}>
          {message}
        </AppText>
      </Stack>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing["2xl"],
  },
  icon: {
    backgroundColor: colors.guard.sectionBg,
    borderRadius: radius["2xl"],
    height: 48,
    width: 48,
  },
});
