"use client";

import { useGetV1SocietiesBySocietyIdMembersDetailQuery } from "@/lib/api/society-members-api";

type UseSocietyMemberDetailOptions = {
  societyId: number;
  memberId: number;
};

export function useSocietyMemberDetail({
  societyId,
  memberId,
}: UseSocietyMemberDetailOptions) {
  const query = useGetV1SocietiesBySocietyIdMembersDetailQuery({
    societyId,
    memberId,
  });
  console.log("useSocietyMemberDetail:", {
    societyId,
    memberId,
    queryData: query.data,
  });
  const detail = query.data?.data?.member_detail;
  const member = detail?.member;
  const ownedFlats = detail?.residences ?? [];
  const residences = detail?.residences ?? [];

  return {
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    member,
    ownedFlats,
    refetch: query.refetch,
    residences,
  };
}
