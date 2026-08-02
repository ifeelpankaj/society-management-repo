import type { Href } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { useLogout } from "@/features/auth/use-logout";
import { ProfileActionRow } from "@/features/profile/components/profile-action-row";
import { ProfileAvatarHero } from "@/features/profile/components/profile-avatar-hero";
import { ProfileInfoRow } from "@/features/profile/components/profile-info-row";
import { ProfileQuickActions } from "@/features/profile/components/profile-quick-actions";
import { ProfileScreenHeader } from "@/features/profile/components/profile-screen-header";
import { ProfileSection } from "@/features/profile/components/profile-section";
import {
  formatDateOfBirth,
  formatDisplayValue,
  formatGender,
  formatLanguage,
  formatPhoneDisplay,
  formatTimezone,
} from "@/features/profile/profile-formatters";
import { useProfileAction } from "@/features/profile/use-profile-action";
import type { ModelsUserResponse } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type ProfileScreenProps = {
  defaultName?: string;
  extraSections?: ReactNode;
  fallbackHomeRoute: Href;
  gate?: ReactNode;
  isLoading?: boolean;
  modals?: ReactNode;
  onRefreshAccess: () => void;
  supportAboutDescription?: string;
  user?: ModelsUserResponse | null;
  workspaceSlot?: ReactNode;
};

export function ProfileScreen({
  defaultName = "User",
  extraSections,
  fallbackHomeRoute,
  gate,
  isLoading = false,
  modals,
  onRefreshAccess,
  supportAboutDescription,
  user,
  workspaceSlot,
}: ProfileScreenProps) {
  const { signOut, isLoading: isSigningOut } = useLogout();
  const { showComingSoon } = useProfileAction();

  if (gate) {
    return <>{gate}</>;
  }

  const displayName = user?.full_name ?? user?.first_name ?? defaultName;

  return (
    <SafeAreaView style={styles.screen}>
      <AppStatusBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <ProfileScreenHeader fallbackHomeRoute={fallbackHomeRoute} title="Profile" />

          {isLoading ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color={colors.brand.orange} size="small" />
            </View>
          ) : (
            <>
              <ProfileAvatarHero
                avatarUrl={user?.avatar_url}
                email={user?.email}
                isActive={user?.is_active !== false}
                name={displayName}
                phone={user?.phone_number}
                onChangePhoto={() => showComingSoon("Change photo")}
              />

              {workspaceSlot}

              <ProfileSection title="Personal Information">
                <ProfileInfoRow
                  icon={{ ios: "person.fill", android: "person", web: "person" }}
                  label="Full Name"
                  value={formatDisplayValue(displayName)}
                />
                <ProfileInfoRow
                  icon={{ ios: "phone.fill", android: "phone", web: "phone" }}
                  label="Phone Number"
                  value={formatPhoneDisplay(user?.phone_number)}
                />
                <ProfileInfoRow
                  icon={{ ios: "envelope.fill", android: "mail", web: "mail" }}
                  label="Email"
                  value={formatDisplayValue(user?.email)}
                />
                <ProfileInfoRow
                  icon={{ ios: "calendar", android: "calendar_today", web: "calendar_today" }}
                  label="Date of Birth"
                  value={formatDateOfBirth(user?.date_of_birth)}
                />
                <ProfileInfoRow
                  icon={{
                    ios: "person.crop.circle",
                    android: "account_circle",
                    web: "account_circle",
                  }}
                  isLast
                  label="Gender"
                  value={formatGender(user?.gender)}
                />
              </ProfileSection>

              <ProfileQuickActions
                onChangePhoto={() => showComingSoon("Change photo")}
                onEditProfile={() => showComingSoon("Edit profile")}
              />

              {extraSections}

              <ProfileSection title="Account & Security">
                <ProfileActionRow
                  icon={{ ios: "lock.fill", android: "lock", web: "lock" }}
                  label="Change Password"
                  onPress={() => showComingSoon("Change password")}
                />
                <ProfileActionRow
                  icon={{ ios: "bell.fill", android: "notifications", web: "notifications" }}
                  label="Notifications"
                  onPress={() => showComingSoon("Notifications")}
                />
                <ProfileActionRow
                  description={formatLanguage(user?.language)}
                  icon={{ ios: "globe", android: "language", web: "language" }}
                  label="Language"
                  onPress={() => showComingSoon("Language settings")}
                />
                <ProfileActionRow
                  description={formatTimezone(user?.timezone)}
                  icon={{ ios: "clock.fill", android: "schedule", web: "schedule" }}
                  label="Timezone"
                  onPress={() => showComingSoon("Timezone settings")}
                />
                <ProfileActionRow
                  icon={{ ios: "arrow.clockwise", android: "refresh", web: "refresh" }}
                  isLast
                  label="Refresh Access"
                  showChevron={false}
                  onPress={onRefreshAccess}
                />
              </ProfileSection>

              <ProfileSection title="Support">
                <ProfileActionRow
                  icon={{ ios: "questionmark.circle.fill", android: "help", web: "help" }}
                  label="Help & Support"
                  onPress={() => showComingSoon("Help & support")}
                />
                <ProfileActionRow
                  description={supportAboutDescription}
                  icon={{ ios: "info.circle.fill", android: "info", web: "info" }}
                  isLast
                  label="About App"
                  onPress={() => showComingSoon("About app")}
                />
              </ProfileSection>

              <Pressable
                accessibilityRole="button"
                disabled={isSigningOut}
                onPress={signOut}
                style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}
              >
                <Text
                  style={[
                    styles.signOutText,
                    { color: isSigningOut ? colors.text.muted : colors.status.error },
                  ]}
                >
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      {modals}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing["2xl"],
  },
  inlineLoading: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
  },
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  signOutButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  signOutButtonPressed: {
    opacity: 0.75,
  },
  signOutText: {
    ...typography.button,
  },
});
