import { type ReactElement, type ReactNode, type ComponentType } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
  type ListRenderItem,
} from "react-native";

import { theme } from "@/lib/theme";

import { EmptyState } from "./empty-state";

type PaginatedListProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  isLoading?: boolean;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  emptyTitle: string;
  emptyMessage: string;
  header?: ReactNode;
  footer?: ReactNode;
  contentContainerClassName?: string;
  ItemSeparatorComponent?: ComponentType<unknown> | null;
};

export function PaginatedList<T>({
  data,
  keyExtractor,
  renderItem,
  isLoading,
  isRefreshing,
  isLoadingMore,
  hasMore,
  onRefresh,
  onLoadMore,
  emptyTitle,
  emptyMessage,
  header,
  footer,
  contentContainerClassName = "px-5 pb-8 pt-6 gap-4",
  ItemSeparatorComponent,
}: PaginatedListProps<T>) {
  if (isLoading && data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator color={theme.guard.teal} />
      </View>
    );
  }

  const listFooter = (
    <>
      {isLoadingMore ? (
        <View className="items-center py-4">
          <ActivityIndicator color={theme.guard.teal} />
        </View>
      ) : null}
      {footer}
    </>
  ) as ReactElement | null;

  return (
    <FlatList
      data={data}
      ItemSeparatorComponent={ItemSeparatorComponent}
      keyboardShouldPersistTaps="handled"
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={
        header ? (
          <View className="gap-4 pb-4">{header}</View>
        ) : (
          <View className="h-6" />
        )
      }
      ListFooterComponent={listFooter}
      ListEmptyComponent={
        <EmptyState title={emptyTitle} message={emptyMessage} onAction={onRefresh} actionLabel="Refresh" />
      }
      contentContainerClassName={contentContainerClassName}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(isRefreshing)}
            tintColor={theme.guard.teal}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
      onEndReached={() => {
        if (hasMore && !isLoadingMore) {
          onLoadMore?.();
        }
      }}
      onEndReachedThreshold={0.4}
    />
  );
}
