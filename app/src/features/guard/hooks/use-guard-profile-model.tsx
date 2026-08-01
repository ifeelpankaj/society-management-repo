import { useMemo, useState } from "react";

import { GuardSocietyGate } from "@/features/guard/components/guard-society-gate";
import { useGuardSociety } from "@/features/guard/guard-context";
import { guardHomeRoute } from "@/features/guard/guard-routes";
import { SocietyAccessCard, SocietySwitchSheet } from "@/features/profile";
import type { ProfileScreenProps } from "@/features/profile/components/profile-screen";
import { useGetV1SocietiesBySocietyIdQuery } from "@/lib/api/generated-api";

export function useGuardProfileModel(): ProfileScreenProps {
  const {
    isLoading,
    memberships,
    refetch,
    requiresSelection,
    selectSociety,
    selectedMembership,
    selectedSocietyId,
    user,
  } = useGuardSociety();
  const [switchSheetVisible, setSwitchSheetVisible] = useState(false);

  const societyQuery = useGetV1SocietiesBySocietyIdQuery(
    { societyId: selectedSocietyId ?? 0 },
    { skip: !selectedSocietyId },
  );

  const societyName =
    societyQuery.data?.data?.society?.name ??
    (selectedSocietyId ? `Society #${selectedSocietyId}` : "No society selected");

  const gate =
    !isLoading && (memberships.length === 0 || requiresSelection) ? (
      <GuardSocietyGate />
    ) : undefined;

  const workspaceSlot = selectedSocietyId ? (
    <SocietyAccessCard
      membershipCount={memberships.length}
      role={selectedMembership?.role}
      societyName={societyName}
      status={selectedMembership?.status}
      onSwitchPress={() => setSwitchSheetVisible(true)}
    />
  ) : null;

  const modals = (
    <SocietySwitchSheet
      memberships={memberships}
      selectedSocietyId={selectedSocietyId}
      visible={switchSheetVisible}
      onClose={() => setSwitchSheetVisible(false)}
      onSelect={selectSociety}
    />
  );

  return useMemo(
    () => ({
      defaultName: "Guard",
      fallbackHomeRoute: guardHomeRoute(),
      gate,
      isLoading,
      modals,
      onRefreshAccess: refetch,
      user,
      workspaceSlot,
    }),
    [gate, isLoading, modals, refetch, user, workspaceSlot],
  );
}
