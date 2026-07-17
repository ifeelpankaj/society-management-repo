import type { PropsWithChildren, ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState } from "@/components/ui";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { theme } from "@/lib/theme";

type GuardScreenShellProps = PropsWithChildren<{
  backgroundColor?: string;
  contentPaddingBottom?: number;
  footer?: ReactNode;
  loadingMessage?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}>;

export function GuardScreenShell({
  backgroundColor = theme.surface.screen,
  children,
  contentPaddingBottom = 32,
  footer,
  loadingMessage = "Opening guard workspace",
  onRefresh,
  refreshing = false,
}: GuardScreenShellProps) {
  const { isLoading, isReady } = useGuardScreen();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (!isReady) {
    return <GuardSocietyGate />;
  }

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]} style={{ backgroundColor }}>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: footer ? 16 : contentPaddingBottom,
            paddingHorizontal: 20,
            paddingTop: 12,
          }}
          nestedScrollEnabled
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                tintColor={theme.guard.teal}
                onRefresh={onRefresh}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
        {footer ? (
          <View
            style={{
              backgroundColor,
              borderTopColor: theme.border.default,
              borderTopWidth: 1,
              paddingBottom: Math.max(insets.bottom, 8),
              paddingHorizontal: 24,
              paddingTop: 12,
            }}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
