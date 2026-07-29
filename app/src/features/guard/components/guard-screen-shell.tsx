import type { PropsWithChildren, ReactNode } from "react";

import { ScreenShell } from "@/components/layout";
import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { useGuardScreen } from "@/features/guard/hooks/use-guard-screen";
import { colors } from "@/theme/colors";

type GuardScreenShellProps = PropsWithChildren<{
  backgroundColor?: string;
  contentPaddingBottom?: number;
  footer?: ReactNode;
  loadingMessage?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}>;

export function GuardScreenShell({
  backgroundColor = colors.surface.screen,
  children,
  contentPaddingBottom,
  footer,
  loadingMessage = "Opening guard workspace",
  onRefresh,
  refreshing = false,
}: GuardScreenShellProps) {
  const { isLoading, isReady } = useGuardScreen();

  return (
    <ScreenShell
      backgroundColor={backgroundColor}
      contentPaddingBottom={contentPaddingBottom}
      footer={footer}
      gate={<GuardSocietyGate />}
      isLoading={isLoading}
      isReady={isReady}
      loadingMessage={loadingMessage}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      {children}
    </ScreenShell>
  );
}
