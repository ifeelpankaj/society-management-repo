import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

import {
  ACTIVITY_LIST_HEIGHT,
  ACTIVITY_ROW_HEIGHT,
} from "@/features/guard/hooks/use-guard-activity-feed";
import {
  formatTimeOfDay,
  getVisitorName,
} from "@/features/guard/guard-utils";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

const G = theme.guard;

function ActivityTimelineItem({ entry }: { entry: ModelsVisitorEntry }) {
  const name = getVisitorName(entry);
  const isExit = entry.status === "checked_out";
  const time = formatTimeOfDay(
    entry.checked_out_at ?? entry.checked_in_at ?? entry.updated_at ?? entry.created_at,
  );
  const dotColor = isExit ? theme.status.error : theme.status.success;
  const verb = isExit ? "exited" : "entered";

  return (
    <View
      className="flex-row items-center gap-3 px-1"
      style={{ height: ACTIVITY_ROW_HEIGHT }}
    >
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
      <Text className="flex-1 text-[14px] leading-5" style={{ color: G.text }}>
        <Text className="font-semibold">{name}</Text>
        <Text style={{ color: G.textMuted }}>
          {" "}
          {verb}
          {time ? ` ${time}` : ""}
        </Text>
      </Text>
    </View>
  );
}

function ItemSeparator() {
  return (
    <View
      style={{
        backgroundColor: "rgba(226, 232, 240, 0.6)",
        height: 1,
        marginLeft: 14,
      }}
    />
  );
}

type TodayActivityFeedProps = {
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  items: ModelsVisitorEntry[];
  onLoadMore: () => void;
  onViewAll: () => void;
  title?: string;
};

export function TodayActivityFeed({
  hasMore,
  isLoading,
  isLoadingMore,
  items,
  onLoadMore,
  onViewAll,
  title = "Today's Activity",
}: TodayActivityFeedProps) {
  return (
    <View
      className="rounded-[18px] px-4 pb-3 pt-4"
      style={{
        backgroundColor: theme.surface.card,
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
      }}
    >
      <View className="mb-1 flex-row items-center justify-between">
        <Text
          className="text-[16px] font-semibold"
          style={{ color: G.text, letterSpacing: -0.2 }}
        >
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="min-h-[44px] justify-center px-1"
          hitSlop={8}
          onPress={onViewAll}
        >
          <Text className="text-[13px] font-medium" style={{ color: G.teal }}>
            View All
          </Text>
        </Pressable>
      </View>

      {isLoading && items.length === 0 ? (
        <View className="items-center justify-center" style={{ height: ACTIVITY_LIST_HEIGHT }}>
          <ActivityIndicator color={G.teal} size="small" />
        </View>
      ) : items.length === 0 ? (
        <View className="justify-center" style={{ height: ACTIVITY_LIST_HEIGHT }}>
          <Text className="text-[13px]" style={{ color: G.textMuted }}>
            No activity yet today.
          </Text>
        </View>
      ) : (
        <FlatList
          nestedScrollEnabled
          data={items}
          ItemSeparatorComponent={ItemSeparator}
          keyExtractor={(item) => `activity-${item.id}`}
          renderItem={({ item }) => <ActivityTimelineItem entry={item} />}
          scrollEnabled={items.length > 4 || hasMore}
          showsVerticalScrollIndicator={false}
          style={{ height: ACTIVITY_LIST_HEIGHT }}
          onEndReached={() => {
            onLoadMore();
          }}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="items-center py-3">
                <ActivityIndicator color={G.teal} size="small" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
