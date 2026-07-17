import { Pressable, Switch, Text, View } from "react-native";

type SettingToggleRowProps = {
  title: string;
  description?: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingToggleRow({
  title,
  description,
  value,
  disabled,
  onValueChange,
}: SettingToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      className={[
        "flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4",
        disabled ? "opacity-55" : "active:opacity-90",
      ].join(" ")}
      onPress={() => {
        if (!disabled) {
          onValueChange(!value);
        }
      }}
    >
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-slate-950">{title}</Text>
        {description ? <Text className="text-sm text-slate-600">{description}</Text> : null}
      </View>
      <Switch
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#cbd5e1", true: "#99f6e4" }}
        thumbColor={value ? "#0f766e" : "#f8fafc"}
      />
    </Pressable>
  );
}
