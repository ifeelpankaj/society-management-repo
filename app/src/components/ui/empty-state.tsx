import { Text, View } from "react-native";

import { Button } from "./button";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
      <View className="h-12 w-12 rounded-full bg-slate-100" />
      <View className="gap-2">
        <Text className="text-center text-xl font-bold text-slate-950">{title}</Text>
        <Text className="text-center text-base leading-6 text-slate-600">{message}</Text>
      </View>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
