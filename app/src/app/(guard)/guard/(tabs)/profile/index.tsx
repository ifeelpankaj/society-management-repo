import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingState } from "@/components/ui";
import { useLogout } from "@/features/auth/use-logout";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { useGuardSociety } from "@/features/guard/guard-context";
import {
  formatDateOfBirth,
  formatDisplayValue,
  formatGender,
  formatLanguage,
  formatPhoneDisplay,
  formatTimezone,
  ProfileActionRow,
  ProfileAvatarHero,
  ProfileInfoRow,
  ProfileQuickActions,
  ProfileSection,
  SocietyAccessCard,
  SocietySwitchSheet,
  useProfileAction,
} from "@/features/profile";
import { useGetV1SocietiesBySocietyIdQuery } from "@/lib/api/generated-api";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export default function GuardProfileScreen() {
  const {
    isLoading,
    memberships,
    refetch,
    selectSociety,
    selectedMembership,
    selectedSocietyId,
    user,
  } = useGuardSociety();
  const { signOut, isLoading: isSigningOut } = useLogout();
  const { showComingSoon } = useProfileAction();
  const [switchSheetVisible, setSwitchSheetVisible] = useState(false);

  const societyQuery = useGetV1SocietiesBySocietyIdQuery(
    { societyId: selectedSocietyId ?? 0 },
    { skip: !selectedSocietyId },
  );

  if (isLoading) {
    return <LoadingState message="Opening profile" />;
  }

  const displayName = user?.full_name ?? user?.first_name ?? "Guard";
  const societyName =
    societyQuery.data?.data?.society?.name ??
    (selectedSocietyId ? `Society #${selectedSocietyId}` : "No society selected");

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <GuardBackHeader title="Profile" />

          <ProfileAvatarHero
            avatarUrl={user?.avatar_url}
            email={user?.email}
            isActive={user?.is_active !== false}
            name={displayName}
            phone={user?.phone_number}
            onChangePhoto={() => showComingSoon("Change photo")}
          />

          <SocietyAccessCard
            membershipCount={memberships.length}
            role={selectedMembership?.role}
            societyName={societyName}
            status={selectedMembership?.status}
            onSwitchPress={() => setSwitchSheetVisible(true)}
          />

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
              icon={{ ios: "person.crop.circle", android: "account_circle", web: "account_circle" }}
              isLast
              label="Gender"
              value={formatGender(user?.gender)}
            />
          </ProfileSection>

          <ProfileQuickActions
            onChangePhoto={() => showComingSoon("Change photo")}
            onEditProfile={() => showComingSoon("Edit profile")}
          />

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
              onPress={refetch}
            />
          </ProfileSection>

          <ProfileSection title="Support">
            <ProfileActionRow
              icon={{ ios: "questionmark.circle.fill", android: "help", web: "help" }}
              label="Help & Support"
              onPress={() => showComingSoon("Help & support")}
            />
            <ProfileActionRow
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
        </View>
      </ScrollView>

      <SocietySwitchSheet
        memberships={memberships}
        selectedSocietyId={selectedSocietyId}
        visible={switchSheetVisible}
        onClose={() => setSwitchSheetVisible(false)}
        onSelect={selectSociety}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  content: {
    gap: spacing["2xl"],
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
