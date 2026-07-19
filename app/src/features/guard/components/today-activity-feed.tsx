import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

import {
  ACTIVITY_LIST_HEIGHT,
  ACTIVITY_ROW_HEIGHT,
} from "@/features/guard/hooks/use-guard-activity-feed";
import {
  formatActivityTimestamp,
  getFlatLabel,
  getVisitorName,
  getVisitorStatusMeta,
  titleize,
} from "@/features/guard/guard-utils";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

const G = theme.guard;

function ActivityTimelineItem({
  entry,
  showFlat,
}: {
  entry: ModelsVisitorEntry;
  showFlat?: boolean;
}) {
  const name = getVisitorName(entry);
  const statusMeta = getVisitorStatusMeta(entry.status);
  const timestamp = formatActivityTimestamp(
    entry.checked_out_at ?? entry.checked_in_at ?? entry.updated_at ?? entry.created_at,
  );
  const purpose = entry.purpose ? titleize(entry.purpose) : "Visitor";
  const flatLabel = showFlat ? getFlatLabel(entry) : null;

  return (
    <View className="gap-1 px-1 py-2" style={{ minHeight: ACTIVITY_ROW_HEIGHT }}>
      <View className="flex-row items-start justify-between gap-2">
        <Text
          className="flex-1 text-[14px] font-semibold leading-5"
          numberOfLines={1}
          style={{ color: G.text }}
        >
          {name}
        </Text>
        <View
          className="rounded-full border px-2 py-0.5"
          style={{
            backgroundColor: statusMeta.bg,
            borderColor: statusMeta.border,
          }}
        >
          <Text className="text-[10px] font-semibold" style={{ color: statusMeta.color }}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      <Text className="text-[12px] leading-4" style={{ color: G.textMuted }} numberOfLines={1}>
        {[purpose, flatLabel].filter(Boolean).join(" · ")}
      </Text>

      {timestamp ? (
        <Text className="text-[12px] font-medium leading-4" style={{ color: G.textMuted }}>
          {timestamp}
        </Text>
      ) : null}
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
  showFlat?: boolean;
  title?: string;
};

export function TodayActivityFeed({
  hasMore,
  isLoading,
  isLoadingMore,
  items,
  onLoadMore,
  onViewAll,
  showFlat = false,
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
          renderItem={({ item }) => (
            <ActivityTimelineItem entry={item} showFlat={showFlat} />
          )}
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
