"use client";

import { type ComponentProps, useCallback } from "react";
import { toast } from "sonner";

import {
  usePostV1SocietyVisitorEntryApproveMutation,
  usePostV1SocietyVisitorEntryCheckOutMutation,
  usePostV1SocietyVisitorEntryRejectMutation,
} from "@/lib/api/society-visitor-entries-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type UseVisitorMutationsOptions = {
  societyId: number;
  onSuccess?: () => void;
};

export function useVisitorMutations({
  societyId,
  onSuccess,
}: UseVisitorMutationsOptions) {
  const [approveEntry, { isLoading: isApproving }] =
    usePostV1SocietyVisitorEntryApproveMutation();
  const [rejectEntry, { isLoading: isRejecting }] =
    usePostV1SocietyVisitorEntryRejectMutation();
  const [checkOutEntry, { isLoading: isCheckingOut }] =
    usePostV1SocietyVisitorEntryCheckOutMutation();

  const busy = isApproving || isRejecting || isCheckingOut;

  const handleApprove = useCallback(
    async (entryId: number) => {
      const toastId = toast.loading("Approving visitor...");
      try {
        const response = await approveEntry({ societyId, entryId }).unwrap();
        toast.success(
          getApiMessage(response, "Visitor entry approved successfully."),
          { id: toastId },
        );
        onSuccess?.();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Could not approve visitor entry."),
          { id: toastId },
        );
      }
    },
    [approveEntry, onSuccess, societyId],
  );

  const handleReject = useCallback(
    async (entryId: number, reason: string, event?: FormSubmitEvent) => {
      event?.preventDefault();

      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        toast.error("Rejection reason is required.");
        return false;
      }

      const toastId = toast.loading("Rejecting visitor...");
      try {
        const response = await rejectEntry({
          societyId,
          entryId,
          reason: trimmedReason,
        }).unwrap();
        toast.success(
          getApiMessage(response, "Visitor entry rejected successfully."),
          { id: toastId },
        );
        onSuccess?.();
        return true;
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Could not reject visitor entry."),
          { id: toastId },
        );
        return false;
      }
    },
    [onSuccess, rejectEntry, societyId],
  );

  const handleCheckOut = useCallback(
    async (entryId: number) => {
      const toastId = toast.loading("Checking out visitor...");
      try {
        const response = await checkOutEntry({ societyId, entryId }).unwrap();
        toast.success(
          getApiMessage(response, "Visitor checked out successfully."),
          { id: toastId },
        );
        onSuccess?.();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Could not check out visitor."),
          { id: toastId },
        );
      }
    },
    [checkOutEntry, onSuccess, societyId],
  );

  return {
    busy,
    handleApprove,
    handleCheckOut,
    handleReject,
    isApproving,
    isCheckingOut,
    isRejecting,
  };
}
