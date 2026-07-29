import type { PropsWithChildren, ReactNode } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState } from "@/components/ui";
import { ScrollContainer } from "@/components/layout/scroll-container";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";

type ScreenShellProps = PropsWithChildren<{
  backgroundColor?: string;
  contentPaddingBottom?: number;
  footer?: ReactNode;
  gate?: ReactNode;
  isLoading?: boolean;
  isReady?: boolean;
  loadingMessage?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  refreshTintColor?: string;
}>;

export function ScreenShell({
  backgroundColor = colors.surface.screen,
  children,
  contentPaddingBottom = layout.screenPaddingBottom,
  footer,
  gate,
  isLoading = false,
  isReady = true,
  loadingMessage = "Loading",
  onRefresh,
  refreshing = false,
  refreshTintColor = colors.guard.teal,
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (!isReady && gate) {
    return <>{gate}</>;
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.flex, { backgroundColor }]}>
      <View style={styles.flex}>
        <ScrollContainer
          style={styles.flex}
          paddingBottom={footer ? spacing.lg : contentPaddingBottom}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} tintColor={refreshTintColor} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollContainer>
        {footer ? (
          <View
            style={[
              styles.footer,
              {
                backgroundColor,
                paddingBottom: Math.max(insets.bottom, 8),
              },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  footer: {
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    paddingHorizontal: layout.footerPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
});
