import { Pressable, Text, View } from "react-native";

import { theme } from "@/lib/theme";

type SegmentTabsProps<T extends string> = {
  compact?: boolean;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentTabs<T extends string>({
  compact = false,
  options,
  value,
  onChange,
}: SegmentTabsProps<T>) {
  return (
    <View
      className="flex-row rounded-xl p-1"
      style={{ backgroundColor: theme.surface.card, borderColor: theme.border.default, borderWidth: 1 }}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            className="flex-1 items-center rounded-lg"
            style={{
              backgroundColor: active ? theme.guard.teal : "transparent",
              paddingVertical: compact ? 8 : 10,
            }}
            onPress={() => onChange(option.value)}
          >
            <Text
              className="font-semibold"
              style={{
                color: active ? "#ffffff" : theme.guard.textMuted,
                fontSize: compact ? 11 : 13,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
