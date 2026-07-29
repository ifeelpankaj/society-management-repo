import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";

type AnnouncementBannerProps = {
  message?: string;
  title?: string;
};

export function AnnouncementBanner({
  message = "AGM Meeting Today at 7 PM",
  title = "Society Announcement",
}: AnnouncementBannerProps) {
  return (
    <View style={styles.container}>
      <AppText variant="caption" color="announcement" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="bodySmall" color="announcement" style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.announcement.bg,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  message: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  title: {
    fontWeight: "600",
    letterSpacing: 1.32,
    opacity: 0.75,
    textTransform: "uppercase",
  },
});
