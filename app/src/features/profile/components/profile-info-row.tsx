import type { SymbolViewProps } from "expo-symbols";
import { Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { theme } from "@/lib/theme";

export type ProfileSymbolName = SymbolViewProps["name"];

type ProfileInfoRowProps = {
  icon: ProfileSymbolName;
  label: string;
  value: string;
  valueMuted?: boolean;
  isLast?: boolean;
};

export function ProfileInfoRow({
  icon,
  label,
  value,
  valueMuted = false,
  isLast = false,
}: ProfileInfoRowProps) {
  return (
    <View
      className={[
        "flex-row items-center gap-3 px-4 py-3.5",
        isLast ? "" : "border-b border-slate-100",
      ].join(" ")}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.guard.tealSoft }}
      >
        <SymbolView name={icon} size={18} tintColor={theme.guard.teal} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: theme.text.muted }}
        >
          {label}
        </Text>
        <Text
          className="text-[15px] font-semibold"
          numberOfLines={2}
          style={{ color: valueMuted ? theme.text.muted : theme.text.primary }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
