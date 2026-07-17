import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { theme } from "@/lib/theme";

type GuardBackHeaderProps = {
  title: string;
};

export function GuardBackHeader({ title }: GuardBackHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3 pb-2 pt-1">
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center rounded-full"
        hitSlop={8}
        style={({ pressed }) => ({
          backgroundColor: pressed ? theme.guard.tealSoft : theme.surface.card,
          borderColor: theme.border.default,
          borderWidth: 1,
        })}
        onPress={() => router.back()}
      >
        <SymbolView
          name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
          size={18}
          tintColor={theme.guard.text}
        />
      </Pressable>
      <Text className="flex-1 text-[18px] font-bold" style={{ color: theme.guard.text }}>
        {title}
      </Text>
    </View>
  );
}
