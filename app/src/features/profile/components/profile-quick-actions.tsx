import { Pressable, Text, View } from "react-native";

import { SectionHeader } from "@/components/ui";
import { theme } from "@/lib/theme";

type ProfileQuickActionsProps = {
  onChangePhoto: () => void;
  onEditProfile: () => void;
};

export function ProfileQuickActions({ onChangePhoto, onEditProfile }: ProfileQuickActionsProps) {
  return (
    <View className="gap-2.5">
      <SectionHeader title="Quick Actions" />
      <View className="flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-1 items-center justify-center rounded-2xl border px-3 active:opacity-85"
          style={{
            backgroundColor: theme.surface.card,
            borderColor: theme.guard.teal,
          }}
          onPress={onEditProfile}
        >
          <Text className="text-sm font-bold" style={{ color: theme.guard.teal }}>
            Edit Profile
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="min-h-12 flex-1 items-center justify-center rounded-2xl border px-3 active:opacity-85"
          style={{
            backgroundColor: theme.surface.card,
            borderColor: theme.guard.teal,
          }}
          onPress={onChangePhoto}
        >
          <Text className="text-sm font-bold" style={{ color: theme.guard.teal }}>
            Change Photo
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
