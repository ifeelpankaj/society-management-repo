import { Text, View } from "react-native";

import { Button, Card } from "@/components/ui";
import type { ModelsVisitorEntry, ModelsVisitorPendingEntry } from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

import { formatDateTime, getFlatLabel, getVisitorName, statusTone, titleize } from "../guard-utils";

type VisitorEntryCardProps = {
  entry: ModelsVisitorEntry | ModelsVisitorPendingEntry;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  loading?: boolean;
  loadingEntryId?: number;
};

export function VisitorEntryCard({
  entry,
  loading,
  loadingEntryId,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
}: VisitorEntryCardProps) {
  const isLoading = loading || loadingEntryId === entry.id;

  return (
    <Card className="gap-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-lg font-bold" style={{ color: theme.text.primary }}>
            {getVisitorName(entry)}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: theme.text.secondary }}>
            Visiting: {getFlatLabel(entry)}
            {entry.purpose ? ` · ${titleize(entry.purpose)}` : ""}
          </Text>
          <Text className="mt-1 text-xs" style={{ color: theme.text.muted }}>
            {entry.expected_at
              ? `Expected ${formatDateTime(entry.expected_at)}`
              : entry.created_at
                ? `Created ${formatDateTime(entry.created_at)}`
                : "Gate record"}
          </Text>
        </View>
        <View className={`rounded-full border px-3 py-1 ${statusTone(entry.status)}`}>
          <Text className="text-xs font-bold">{titleize(entry.status)}</Text>
        </View>
      </View>

      {entry.notes ? (
        <Text className="text-sm" style={{ color: theme.text.secondary }}>
          {entry.notes}
        </Text>
      ) : null}

      {primaryActionLabel || secondaryActionLabel ? (
        <View className="flex-row gap-3">
          {secondaryActionLabel ? (
            <View className="min-w-0 flex-1">
              <Button
                compact
                fullWidth
                title={secondaryActionLabel}
                variant="secondary"
                onPress={onSecondaryAction}
              />
            </View>
          ) : null}
          {primaryActionLabel ? (
            <View className="min-w-0 flex-1">
              <Button
                compact
                fullWidth
                loading={isLoading}
                title={primaryActionLabel}
                onPress={onPrimaryAction}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
