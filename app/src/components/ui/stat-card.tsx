import { Text, View, type ViewStyle } from "react-native";

import { theme } from "@/lib/theme";

type StatCardProps = {
  label: string;
  style?: ViewStyle;
  tone?: "default" | "teal" | "warning" | "success";
  value: string | number;
};

const toneColors: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: theme.text.primary,
  success: theme.status.success,
  teal: theme.operational.primary,
  warning: theme.status.warning,
};

export function StatCard({ label, style, tone = "default", value }: StatCardProps) {
  return (
    <View
      className="min-w-[46%] flex-1 gap-2 rounded-[18px] p-4"
      style={[
        {
          backgroundColor: theme.surface.card,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
        },
        style,
      ]}
    >
      <Text
        className="text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{ color: theme.text.muted }}
      >
        {label}
      </Text>
      <Text
        className="text-[30px] font-bold leading-none"
        style={{ color: toneColors[tone], letterSpacing: -0.5 }}
      >
        {value}
      </Text>
    </View>
  );
}
