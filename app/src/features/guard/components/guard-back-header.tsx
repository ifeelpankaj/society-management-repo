import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/icons";
import { Row } from "@/components/layout";
import { guardHomeRoute } from "@/features/guard/guard-routes";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

type GuardBackHeaderProps = {
  fallbackHomeRoute?: Href;
  title: string;
};

export function GuardBackHeader({ fallbackHomeRoute, title }: GuardBackHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHomeRoute ?? guardHomeRoute());
  };

  return (
    <Row align="center" gap="md" style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        onPress={handleBack}
      >
        <AppIcon color={colors.guard.text} name="back" size={18} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    backgroundColor: colors.surface.card,
    borderColor: colors.border.default,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backButtonPressed: {
    backgroundColor: colors.guard.tealSoft,
  },
  header: {
    justifyContent: "flex-start",
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  title: {
    color: colors.guard.text,
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
  },
});
