import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import type { ProfileSymbolName } from "@/features/profile/components/profile-info-row";
import { theme } from "@/lib/theme";

type ProfileActionRowProps = {
  description?: string;
  destructive?: boolean;
  icon: ProfileSymbolName;
  isLast?: boolean;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
};

export function ProfileActionRow({
  description,
  destructive = false,
  icon,
  isLast = false,
  label,
  onPress,
  showChevron = true,
}: ProfileActionRowProps) {
  const accent = destructive ? theme.status.error : theme.guard.teal;
  const iconBg = destructive ? theme.status.errorSoft : theme.guard.tealSoft;

  return (
    <Pressable
      accessibilityRole="button"
      className={[
        "flex-row items-center gap-3 px-4 py-3.5 active:opacity-85",
        isLast ? "" : "border-b border-slate-100",
      ].join(" ")}
      onPress={onPress}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        <SymbolView name={icon} size={18} tintColor={accent} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className="text-[15px] font-semibold"
          style={{ color: destructive ? theme.status.error : theme.text.primary }}
        >
          {label}
        </Text>
        {description ? (
          <Text className="text-sm" style={{ color: theme.text.secondary }}>
            {description}
          </Text>
        ) : null}
      </View>
      {showChevron ? (
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
          size={16}
          tintColor={theme.text.muted}
        />
      ) : null}
    </Pressable>
  );
}
