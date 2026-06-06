"use client";

import { useGetV1SocietiesBySocietyIdMembersDetailQuery } from "@/lib/api/society-members-api";
import { useGetV1SocietyMemberVisitorApprovalStatsQuery } from "@/lib/api/society-visitor-entries-api";

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
  const statsQuery = useGetV1SocietyMemberVisitorApprovalStatsQuery({
    societyId,
    memberId,
  });

  const detail = query.data?.data?.member_detail;
  const member = detail?.member;
  const ownedFlats = detail?.owned_flats ?? detail?.residences ?? [];
  const residences = detail?.residences ?? [];
  const approvalStats = statsQuery.data?.data?.stats;

  return {
    approvalStats,
    approvalStatsQuery: statsQuery,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    member,
    ownedFlats,
    refetch: () => {
      query.refetch();
      statsQuery.refetch();
    },
    residences,
  };
}
