"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  getSocietyDashboardRoute,
  isAdminWorkspaceMembership,
} from "@/features/auth/auth-routing";
import { useGetV1SocietiesMyQuery } from "@/lib/api/generated-api";

type UseAdminSocietySessionOptions = {
  skip?: boolean;
  selectedSocietyId?: number;
};

export function useAdminSocietySession(
  options: UseAdminSocietySessionOptions = {},
) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useGetV1SocietiesMyQuery(undefined, {
    skip: options.skip,
  });
  const memberships = data?.data?.societies ?? [];

  const allowedMemberships = useMemo(
    () => memberships.filter(isAdminWorkspaceMembership),
    [memberships],
  );

  const selectedMembership = useMemo(() => {
    if (options.selectedSocietyId) {
      const matched = allowedMemberships.find(
        (membership) =>
          (membership.society?.id ?? membership.member?.society_id) ===
          options.selectedSocietyId,
      );
      if (matched) return matched;
    }

    return allowedMemberships[0] ?? null;
  }, [allowedMemberships, options.selectedSocietyId]);

  const selectedSociety = selectedMembership?.society ?? null;
  const selectedMembershipRole = selectedMembership?.member?.role ?? null;

  const changeSelectedSociety = (societyId: number) => {
    if (Number.isSafeInteger(societyId) && societyId > 0) {
      router.push(getSocietyDashboardRoute(societyId));
    }
  };

  return {
    allowedMemberships,
    changeSelectedSociety,
    isStaff: selectedMembershipRole === "staff",
    memberships,
    selectedMembershipRole,
    selectedSociety,
    selectedSocietyId:
      selectedSociety?.id ?? selectedMembership?.member?.society_id,
    isLoading,
    isFetching,
  };
}
