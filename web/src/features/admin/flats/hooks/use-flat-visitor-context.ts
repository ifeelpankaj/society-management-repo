"use client";

import { useGetV1SocietyFlatVisitorContextQuery } from "@/lib/api/society-visitor-entries-api";

type UseFlatVisitorContextOptions = {
  societyId: number;
  flatId: number;
};

export function useFlatVisitorContext({
  societyId,
  flatId,
}: UseFlatVisitorContextOptions) {
  const query = useGetV1SocietyFlatVisitorContextQuery({ societyId, flatId });
  const context = query.data?.data?.context;

  return {
    context,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
