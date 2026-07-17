import type { PropsWithChildren, ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingState } from "@/components/ui";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import { theme } from "@/lib/theme";

type ResidentScreenShellProps = PropsWithChildren<{
  backgroundColor?: string;
  contentPaddingBottom?: number;
  loadingMessage?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  footer?: ReactNode;
}>;

export function ResidentScreenShell({
  backgroundColor = theme.guard.screenBg,
  children,
  contentPaddingBottom = 32,
  footer,
  loadingMessage = "Opening resident home",
  onRefresh,
  refreshing = false,
}: ResidentScreenShellProps) {
  const { isLoading, requiresSelection, selectedResidence } = useResident();

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (requiresSelection || !selectedResidence) {
    return <ResidentSocietyGate />;
  }

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]} style={{ backgroundColor }}>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: contentPaddingBottom,
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
        {footer}
      </View>
    </SafeAreaView>
  );
}
