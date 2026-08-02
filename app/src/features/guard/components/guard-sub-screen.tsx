import type { PropsWithChildren, ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppStatusBar } from "@/components/layout/app-status-bar";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";

type GuardSubScreenProps = PropsWithChildren<{
  headerExtra?: ReactNode;
  title: string;
}>;

export function GuardSubScreen({ children, headerExtra, title }: GuardSubScreenProps) {
  const { isLoading, isReady, memberships, requiresSelection } = useGuardScreen();

  if (!isLoading && (memberships.length === 0 || requiresSelection)) {
    return <GuardSocietyGate />;
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <AppStatusBar />
      <View style={styles.header}>
        <GuardBackHeader title={title} />
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
