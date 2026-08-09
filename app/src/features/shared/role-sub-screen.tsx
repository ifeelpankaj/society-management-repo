import type { PropsWithChildren, ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { ScreenBackHeader } from "@/components/layout/screen-back-header";
import type { Href } from "expo-router";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";

type RoleSubScreenProps = PropsWithChildren<{
  fallbackHomeRoute: Href;
  gate: ReactNode;
  headerExtra?: ReactNode;
  headerTrailing?: ReactNode;
  isLoading?: boolean;
  isReady?: boolean;
  showGate?: boolean;
  title: string;
}>;

export function RoleSubScreen({
  children,
  fallbackHomeRoute,
  gate,
  headerExtra,
  headerTrailing,
  isLoading = false,
  isReady = true,
  showGate = false,
  title,
}: RoleSubScreenProps) {
  if (showGate) {
    return <>{gate}</>;
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <AppStatusBar />
      <View style={styles.header}>
        <ScreenBackHeader fallbackHomeRoute={fallbackHomeRoute} title={title} trailing={headerTrailing} />
        {headerExtra}
      </View>
      {isLoading || !isReady ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator color={colors.guard.teal} size="small" />
        </View>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  inlineLoading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
  },
  screen: {
    backgroundColor: colors.guard.screenBg,
    flex: 1,
  },
});
