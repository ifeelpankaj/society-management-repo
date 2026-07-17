import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingState } from "@/components/ui";
import { useLogout } from "@/features/auth/use-logout";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { titleize } from "@/features/guard/guard-utils";
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
  ResidenceAccessCard,
  ResidenceSwitchSheet,
  useProfileAction,
} from "@/features/profile";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import {
  residentMembersAddRoute,
  residentVisitorSettingsRoute,
} from "@/features/resident/resident-routes";
import { theme } from "@/lib/theme";

function formatFlatLabel(residence?: {
  block?: string | null;
  flat_number?: string | null;
}) {
  if (!residence) {
    return "Flat";
  }

  const parts = [
    residence.block ? `Block ${residence.block}` : null,
    residence.flat_number ? `Flat ${residence.flat_number}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Flat";
}

export default function ResidentProfileScreen() {
  const router = useRouter();
  const {
    canManageFlatVisitors,
    flatId,
    isLoading,
    isPrimary,
    refetch,
    requiresSelection,
    residences,
    selectResidence,
    selectedResidence,
    user,
  } = useResident();
  const { signOut, isLoading: isSigningOut } = useLogout();
  const { showComingSoon } = useProfileAction();
  const [switchSheetVisible, setSwitchSheetVisible] = useState(false);

  if (isLoading) {
    return <LoadingState message="Opening profile" />;
  }

  if (requiresSelection) {
    return <ResidentSocietyGate />;
  }

  const displayName = user?.full_name ?? user?.first_name ?? "Resident";
  const societyName = selectedResidence?.society_name ?? "Your society";
  const flatLabel = formatFlatLabel(selectedResidence);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-3">
        <View className="gap-6">
          <GuardBackHeader title="Profile" />

          <ProfileAvatarHero
            avatarUrl={user?.avatar_url}
            email={user?.email}
            isActive={user?.is_active !== false}
            name={displayName}
            phone={user?.phone_number}
            onChangePhoto={() => showComingSoon("Change photo")}
          />

          {selectedResidence ? (
            <ResidenceAccessCard
              flatLabel={flatLabel}
              isPrimary={isPrimary}
              residenceCount={residences.length}
              societyName={societyName}
              status={selectedResidence.status}
              onSwitchPress={() => setSwitchSheetVisible(true)}
            />
          ) : null}

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

          <ProfileSection title="Residence">
            <ProfileActionRow
              description={flatLabel}
              icon={{ ios: "house.fill", android: "home", web: "home" }}
              label={societyName}
              onPress={() => {
                if (residences.length > 1) {
                  setSwitchSheetVisible(true);
                }
              }}
            />
            {canManageFlatVisitors ? (
              <ProfileActionRow
                icon={{ ios: "slider.horizontal.3", android: "tune", web: "tune" }}
                label="Visitor settings"
                onPress={() => router.push(residentVisitorSettingsRoute())}
              />
            ) : null}
            {!canManageFlatVisitors ? (
              <ProfileActionRow
                icon={{ ios: "person.2.fill", android: "group", web: "group" }}
                isLast
                label="Flat members"
                onPress={() => showComingSoon("Flat members")}
              />
            ) : (
              <>
                <ProfileActionRow
                  icon={{ ios: "person.2.fill", android: "group", web: "group" }}
                  label="Flat members"
                  onPress={() => router.push(residentMembersAddRoute())}
                />
                <ProfileActionRow
                  icon={{ ios: "person.badge.plus", android: "person_add", web: "person_add" }}
                  isLast
                  label="Add member"
                  onPress={() => router.push(residentMembersAddRoute())}
                />
              </>
            )}
          </ProfileSection>

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
              description={`${titleize(selectedResidence?.role ?? "resident")} access`}
              icon={{ ios: "info.circle.fill", android: "info", web: "info" }}
              isLast
              label="About App"
              onPress={() => showComingSoon("About app")}
            />
          </ProfileSection>

          <Pressable
            accessibilityRole="button"
            className="items-center py-3 active:opacity-75"
            disabled={isSigningOut}
            onPress={signOut}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: isSigningOut ? theme.text.muted : theme.status.error }}
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <ResidenceSwitchSheet
        residences={residences}
        selectedFlatId={flatId}
        visible={switchSheetVisible}
        onClose={() => setSwitchSheetVisible(false)}
        onSelect={selectResidence}
      />
    </SafeAreaView>
  );
}
