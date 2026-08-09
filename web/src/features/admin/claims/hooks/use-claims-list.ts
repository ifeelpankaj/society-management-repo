"use client";

import { type ComponentProps, useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import type {
  ModelsFlatClaimResponse,
  ModelsFlatClaimStatus,
} from "@/lib/api/generated-api";
import {
  usePostV1SocietiesBySocietyIdFlatClaimsAndClaimIdApproveMutation,
  usePostV1SocietiesBySocietyIdFlatClaimsAndClaimIdRejectMutation,
} from "@/lib/api/generated-api";
import {
  useGetV1SocietyFlatClaimQuery,
  useGetV1SocietyFlatClaimsQuery,
} from "@/lib/api/society-flat-claims-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { useDebouncedValue, usePagination, useQueryRefetch } from "@/lib/hooks";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type UseClaimsListOptions = {
  societyId: number;
};

function isEmptyClaimsResponse(error: unknown) {
  const apiError = error as { status?: unknown; data?: { message?: string } };
  const message = apiError.data?.message?.toLowerCase() ?? "";

  return (
    apiError.status === 404 ||
    message.includes("no claim") ||
    message.includes("not found")
  );
}

export function useClaimsList({ societyId }: UseClaimsListOptions) {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("all");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [status, setStatus] = useState<ModelsFlatClaimStatus | "all">("all");
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
  const [rejectingClaim, setRejectingClaim] =
    useState<ModelsFlatClaimResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const estimatedTotalRef = useRef(0);

  const { page, pageSize, offset, totalPages, setPage, setPageSize } =
    usePagination({
      totalItems: estimatedTotalRef.current,
      resetDeps: [debouncedSearch, searchMode, status],
    });

  const claimsQuery = useGetV1SocietyFlatClaimsQuery({
    societyId,
    search: debouncedSearch.trim() || undefined,
    searchMode,
    status: status === "all" ? undefined : status,
    limit: pageSize,
    offset,
  });
  const detailQuery = useGetV1SocietyFlatClaimQuery(
    { societyId, claimId: selectedClaimId ?? 0 },
    { skip: !selectedClaimId },
  );
  const [approveClaim, { isLoading: isApproving }] =
    usePostV1SocietiesBySocietyIdFlatClaimsAndClaimIdApproveMutation();
  const [rejectClaim, { isLoading: isRejecting }] =
    usePostV1SocietiesBySocietyIdFlatClaimsAndClaimIdRejectMutation();

  const claims = claimsQuery.data?.data?.claims ?? [];
  const selectedClaim = detailQuery.data?.data?.claim;
  const actionInProgress = isApproving || isRejecting;
  const hasNextPage = claims.length >= pageSize;
  estimatedTotalRef.current = hasNextPage
    ? page * pageSize + 1
    : (page - 1) * pageSize + claims.length;
  const resolvedTotalPages = hasNextPage
    ? Math.max(totalPages, page + 1)
    : page;
  const showEmptyClaims =
    !claimsQuery.isLoading &&
    (claims.length === 0 ||
      (claimsQuery.isError && isEmptyClaimsResponse(claimsQuery.error)));

  const { refetch: refetchClaims, isFetching } = useQueryRefetch(claimsQuery);

  const refetch = useCallback(() => {
    refetchClaims();
    if (selectedClaimId) {
      detailQuery.refetch();
    }
  }, [detailQuery, refetchClaims, selectedClaimId]);

  const handleApprove = useCallback(
    async (claim: ModelsFlatClaimResponse) => {
      if (!claim.id) return;

      const toastId = toast.loading("Approving claim...");

      try {
        const response = await approveClaim({
          societyId,
          claimId: claim.id,
        }).unwrap();

        toast.success(
          getApiMessage(response, "Flat claim approved successfully."),
          { id: toastId },
        );
        refetch();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Could not approve flat claim."),
          {
            id: toastId,
          },
        );
      }
    },
    [approveClaim, refetch, societyId],
  );

  const handleReject = useCallback(
    async (event: FormSubmitEvent) => {
      event.preventDefault();

      if (!rejectingClaim?.id) return;

      const reason = rejectReason.trim();
      if (!reason) {
        toast.error("Rejection reason is required.");
        return;
      }

      const toastId = toast.loading("Rejecting claim...");

      try {
        const response = await rejectClaim({
          societyId,
          claimId: rejectingClaim.id,
          modelsRejectFlatClaimRequest: { reason },
        }).unwrap();

        toast.success(
          getApiMessage(response, "Flat claim rejected successfully."),
          { id: toastId },
        );
        setRejectingClaim(null);
        setRejectReason("");
        refetch();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not reject flat claim."), {
          id: toastId,
        });
      }
    },
    [refetch, rejectClaim, rejectReason, rejectingClaim, societyId],
  );

  const resolvedPageStart = claims.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const resolvedPageEnd = (page - 1) * pageSize + claims.length;

  return {
    actionInProgress,
    claims,
    detailQuery,
    handleApprove,
    handleReject,
    isFetching,
    isRejecting,
    page,
    pageSize,
    refetch,
    rejectReason,
    rejectingClaim,
    resolvedPageEnd,
    resolvedPageStart,
    resolvedTotalPages,
    search,
    searchMode,
    selectedClaim,
    selectedClaimId,
    setPage,
    setPageSize,
    setRejectReason,
    setRejectingClaim,
    setSearch,
    setSearchMode,
    setSelectedClaimId,
    setStatus,
    showEmptyClaims,
    status,
    totalItems: estimatedTotalRef.current,
    claimsQuery,
  };
}
