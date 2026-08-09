import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { Row } from "@/components/layout";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

type DashboardAnnouncementProps = {
  message?: string;
  onPress?: () => void;
  title?: string;
};

export function DashboardAnnouncement({
  message = "AGM Meeting Today at 7 PM",
  onPress,
  title = "Society Announcement",
}: DashboardAnnouncementProps) {
  const content = (
    <View style={styles.container}>
      <Row align="center" gap="md" justify="flex-start">
        <View style={styles.iconWrap}>
          <SymbolView
            name={{ ios: "megaphone.fill", android: "campaign", web: "campaign" }}
            size={18}
            tintColor={colors.brand.orange}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        {onPress ? (
          <SymbolView
            name={{
              ios: "chevron.right",
              android: "chevron_right",
              web: "chevron_right",
            }}
            size={16}
            tintColor={colors.brand.orange}
          />
        ) : null}
      </Row>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    borderColor: colors.dashboard.cardBorder,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.card,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.brand.orangeSoft,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  message: {
    color: colors.brand.navy,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  title: {
    color: colors.brand.orange,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
});
