import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { theme } from "@/lib/theme";

type UserAvatarProps = {
  imageUrl?: string | null;
  name?: string | null;
  onPress?: () => void;
  showCameraBadge?: boolean;
  size?: number;
};

function getInitials(name?: string | null) {
  const trimmed = name?.trim();

  if (!trimmed) {
    return "G";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return parts[0]?.slice(0, 2).toUpperCase() ?? "G";
}

export function UserAvatar({
  imageUrl,
  name,
  onPress,
  showCameraBadge = false,
  size = 44,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const fontSize = size >= 44 ? 16 : 13;
  const badgeSize = Math.max(28, Math.round(size * 0.3));

  const content = imageUrl ? (
    <Image
      accessibilityLabel={name ? `${name} profile photo` : "Profile photo"}
      contentFit="cover"
      source={{ uri: imageUrl }}
      style={{ borderRadius: size / 2, height: size, width: size }}
    />
  ) : (
    <View
      className="items-center justify-center"
      style={{
        backgroundColor: theme.guard.tealSoft,
        borderRadius: size / 2,
        height: size,
        width: size,
      }}
    >
      <Text className="font-bold" style={{ color: theme.guard.teal, fontSize }}>
        {initials}
      </Text>
    </View>
  );

  const ring = (
    <View style={{ position: "relative" }}>
      <View
        style={{
          borderColor: "rgba(15, 23, 42, 0.08)",
          borderRadius: size / 2 + 2,
          borderWidth: 1.5,
          padding: 1.5,
        }}
      >
        {content}
      </View>
      {showCameraBadge ? (
        <View
          className="absolute items-center justify-center"
          style={{
            backgroundColor: theme.guard.teal,
            borderColor: theme.surface.card,
            borderRadius: badgeSize / 2,
            borderWidth: 2,
            bottom: 0,
            height: badgeSize,
            right: 0,
            width: badgeSize,
          }}
        >
          <SymbolView
            name={{ ios: "camera.fill", android: "photo_camera", web: "photo_camera" }}
            size={Math.round(badgeSize * 0.45)}
            tintColor="#ffffff"
          />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return ring;
  }

  return (
    <Pressable
      accessibilityLabel={showCameraBadge ? "Change profile photo" : "Open profile"}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      onPress={onPress}
    >
      {ring}
    </Pressable>
  );
}
