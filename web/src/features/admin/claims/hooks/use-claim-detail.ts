"use client";

import { type ComponentProps, useCallback, useState } from "react";
import { toast } from "sonner";

import {
  usePostV1SocietiesBySocietyIdFlatClaimsAndClaimIdApproveMutation,
  usePostV1SocietiesBySocietyIdFlatClaimsAndClaimIdRejectMutation,
} from "@/lib/api/generated-api";
import { useGetV1SocietyFlatClaimQuery } from "@/lib/api/society-flat-claims-api";
import { useGetV1SocietyFlatResidentsQuery } from "@/lib/api/society-flat-residents-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type UseClaimDetailOptions = {
  societyId: number;
  claimId: number;
};

export function useClaimDetail({ societyId, claimId }: UseClaimDetailOptions) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);

  const claimQuery = useGetV1SocietyFlatClaimQuery({ societyId, claimId });
  const claim = claimQuery.data?.data?.claim;
  const flatId = claim?.flat_id;

  const residentsQuery = useGetV1SocietyFlatResidentsQuery(
    { societyId, flatId: flatId ?? 0, limit: 100 },
    { skip: !flatId },
  );

  const [approveClaim, { isLoading: isApproving }] =
    usePostV1SocietiesBySocietyIdFlatClaimsAndClaimIdApproveMutation();
  const [rejectClaim, { isLoading: isRejecting }] =
    usePostV1SocietiesBySocietyIdFlatClaimsAndClaimIdRejectMutation();

  const busy = isApproving || isRejecting;
  const residents = residentsQuery.data?.data?.residents ?? [];
  const isPending = claim?.status === "pending";

  const refetch = useCallback(() => {
    claimQuery.refetch();
    if (flatId) residentsQuery.refetch();
  }, [claimQuery, flatId, residentsQuery]);

  const handleApprove = useCallback(async () => {
    if (!claim?.id) return;
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
      setApproveOpen(false);
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not approve flat claim."), {
        id: toastId,
      });
    }
  }, [approveClaim, claim, refetch, societyId]);

  const handleReject = useCallback(
    async (event: FormSubmitEvent) => {
      event.preventDefault();
      if (!claim?.id) return;
      const reason = rejectReason.trim();
      if (!reason) {
        toast.error("Rejection reason is required.");
        return;
      }
      const toastId = toast.loading("Rejecting claim...");
      try {
        const response = await rejectClaim({
          societyId,
          claimId: claim.id,
          modelsRejectFlatClaimRequest: { reason },
        }).unwrap();
        toast.success(
          getApiMessage(response, "Flat claim rejected successfully."),
          { id: toastId },
        );
        setRejectOpen(false);
        setRejectReason("");
        refetch();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not reject flat claim."), {
          id: toastId,
        });
      }
    },
    [claim, refetch, rejectClaim, rejectReason, societyId],
  );

  return {
    approveOpen,
    busy,
    claim,
    claimQuery,
    handleApprove,
    handleReject,
    isPending,
    isRejecting,
    rejectOpen,
    rejectReason,
    refetch,
    residents,
    residentsQuery,
    setApproveOpen,
    setRejectOpen,
    setRejectReason,
  };
}
