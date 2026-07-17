import { Text, View } from "react-native";

import type { ModelsVisitorPurpose } from "@/lib/api/generated-api";
import { titleize } from "@/features/guard/guard-utils";

export function PurposeBadge({ purpose }: { purpose?: ModelsVisitorPurpose | null }) {
  return (
    <View className="self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
      <Text className="text-xs font-bold text-slate-700">{titleize(purpose)}</Text>
    </View>
  );
}
