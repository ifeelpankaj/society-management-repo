import { Text, View } from "react-native";

type BadgeTone = "slate" | "emerald" | "amber" | "rose" | "blue";

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  blue: "bg-blue-50 text-blue-700",
};

export function Badge({ label, tone = "slate" }: BadgeProps) {
  return (
    <View className="self-start rounded-full">
      <Text className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{label}</Text>
    </View>
  );
}
