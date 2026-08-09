import type { PropsWithChildren, ReactNode } from "react";

import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import { residentDashboardRoute } from "@/features/resident/resident-routes";
import { RoleSubScreen } from "@/features/shared/role-sub-screen";

type ResidentSubScreenProps = PropsWithChildren<{
  headerExtra?: ReactNode;
  headerTrailing?: ReactNode;
  title: string;
}>;

export function ResidentSubScreen({
  children,
  headerExtra,
  headerTrailing,
  title,
}: ResidentSubScreenProps) {
  const { isLoading, requiresSelection, residences } = useResident();

  return (
    <RoleSubScreen
      fallbackHomeRoute={residentDashboardRoute()}
      gate={<ResidentSocietyGate />}
      headerExtra={headerExtra}
      headerTrailing={headerTrailing}
      isLoading={isLoading}
      isReady={!requiresSelection && residences.length > 0}
      showGate={!isLoading && (residences.length === 0 || requiresSelection)}
      title={title}
    >
      {children}
    </RoleSubScreen>
  );
}
