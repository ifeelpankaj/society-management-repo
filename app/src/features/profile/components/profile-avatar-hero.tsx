import { Text, View } from "react-native";

import { UserAvatar } from "@/components/ui";
import { formatPhoneDisplay } from "@/features/profile/profile-formatters";
import { theme } from "@/lib/theme";

type ProfileAvatarHeroProps = {
  avatarUrl?: string | null;
  email?: string | null;
  isActive?: boolean;
  name: string;
  onChangePhoto?: () => void;
  phone?: string | null;
};

export function ProfileAvatarHero({
  avatarUrl,
  email,
  isActive = true,
  name,
  onChangePhoto,
  phone,
}: ProfileAvatarHeroProps) {
  const phoneDisplay = formatPhoneDisplay(phone);

  return (
    <View className="items-center gap-3 py-2">
      <UserAvatar
        imageUrl={avatarUrl}
        name={name}
        showCameraBadge={Boolean(onChangePhoto)}
        size={96}
        onPress={onChangePhoto}
      />

      <View className="items-center gap-1">
        <Text
          className="text-center text-2xl font-bold tracking-tight"
          style={{ color: theme.text.primary }}
        >
          {name}
        </Text>
        {email ? (
          <Text className="text-sm" style={{ color: theme.text.secondary }}>
            {email}
          </Text>
        ) : null}
        {phone && phoneDisplay !== "—" ? (
          <Text className="text-sm" style={{ color: theme.text.secondary }}>
            {phoneDisplay}
          </Text>
        ) : null}
      </View>

      <View
        className="flex-row items-center gap-2 rounded-full px-3 py-1.5"
        style={{
          backgroundColor: isActive ? theme.status.successSoft : theme.surface.muted,
        }}
      >
        <View
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: isActive ? theme.status.success : theme.text.muted,
          }}
        />
        <Text
          className="text-xs font-semibold"
          style={{ color: isActive ? theme.status.success : theme.text.muted }}
        >
          {isActive ? "Active Account" : "Inactive Account"}
        </Text>
      </View>
    </View>
  );
}
