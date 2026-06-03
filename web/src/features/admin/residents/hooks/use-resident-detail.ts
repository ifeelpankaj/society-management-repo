"use client";

import { useGetV1SocietiesBySocietyIdMembersDetailQuery } from "@/lib/api/society-members-api";

type UseResidentDetailOptions = {
  societyId: number;
  memberId: number;
};

export function useResidentDetail({
  societyId,
  memberId,
}: UseResidentDetailOptions) {
  const query = useGetV1SocietiesBySocietyIdMembersDetailQuery({
    societyId,
    memberId,
  });

  const detail = query.data?.data?.member_detail;
  const member = detail?.member;
  const ownedFlats = detail?.owned_flats ?? [];
  const residences = detail?.residences ?? [];

  return {
    isError: query.isError,
    isLoading: query.isLoading,
    member,
    ownedFlats,
    refetch: query.refetch,
    residences,
  };
}
