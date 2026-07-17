import { Pressable, Text } from "react-native";

type QuickActionProps = {
  label: string;
  onPress: () => void;
  tone?: "light" | "danger";
};

export function QuickAction({ label, onPress, tone = "light" }: QuickActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={[
        "min-h-16 flex-1 items-center justify-center rounded-2xl border px-3 active:opacity-80",
        tone === "danger"
          ? "border-rose-200 bg-rose-50"
          : "border-amber-100 bg-[#fffbf5] shadow-sm shadow-amber-100",
      ].join(" ")}
      onPress={onPress}
    >
      <Text
        className={[
          "text-center text-sm font-bold",
          tone === "danger" ? "text-rose-700" : "text-slate-900",
        ].join(" ")}
      >
        {label}
      </Text>
    </Pressable>
  );
}
