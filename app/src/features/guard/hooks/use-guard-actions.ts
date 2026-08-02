import { useCallback, useState } from "react";

import { getApiMessage } from "@/features/auth/api-error";
import type { ModelsGuardApproveEntryRequest } from "@/lib/api/generated-api";
import {
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApproveAndCheckInMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckInMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdGuardApproveMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdNotifyMutation,
} from "@/lib/api/generated-api";
import { usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOutMutation } from "@/lib/api/generated-api";

export type GuardActionOptions = {
  onBehalf?: boolean;
  reason?: string;
};

function toApproveRequest(opts?: GuardActionOptions): ModelsGuardApproveEntryRequest | undefined {
  if (!opts?.onBehalf && !opts?.reason) {
    return undefined;
  }
  return { on_behalf: opts.onBehalf, reason: opts.reason };
}

export function useGuardActions(societyId: number) {
  const [activeEntryId, setActiveEntryId] = useState<number>();
  const [notify, notifyState] = usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdNotifyMutation();
  const [approve, approveState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdGuardApproveMutation();
  const [approveAndCheckIn, approveAndCheckInState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApproveAndCheckInMutation();
  const [checkIn, checkInState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckInMutation();
  const [checkOut, checkOutState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckOutMutation();

  const notifyResident = useCallback(
    async (entryId: number) => {
      setActiveEntryId(entryId);
      try {
        const response = await notify({ societyId, entryId }).unwrap();
        return { success: true as const, message: response.message ?? "Resident notified" };
      } catch (error) {
        return { success: false as const, message: getApiMessage(error, "Could not notify resident") };
      } finally {
        setActiveEntryId(undefined);
      }
    },
    [notify, societyId],
  );

  const approveEntry = useCallback(
    async (entryId: number, opts?: GuardActionOptions) => {
      setActiveEntryId(entryId);
      try {
        const response = await approve({
          societyId,
          entryId,
          modelsGuardApproveEntryRequest: toApproveRequest(opts),
        }).unwrap();
        return {
          success: true as const,
          message: response.message ?? "Visitor approved",
          entry: response.data?.entry,
        };
      } catch (error) {
        return { success: false as const, message: getApiMessage(error, "Could not approve visitor") };
      } finally {
        setActiveEntryId(undefined);
      }
    },
    [approve, societyId],
  );

  const approveAndCheckInEntry = useCallback(
    async (entryId: number, opts?: GuardActionOptions) => {
      setActiveEntryId(entryId);
      try {
        const response = await approveAndCheckIn({
          societyId,
          entryId,
          modelsGuardApproveEntryRequest: toApproveRequest(opts),
        }).unwrap();
        return {
          success: true as const,
          message: response.message ?? "Visitor checked in",
          entry: response.data?.entry,
        };
      } catch (error) {
        return {
          success: false as const,
          message: getApiMessage(error, "Could not approve and check in visitor"),
        };
      } finally {
        setActiveEntryId(undefined);
      }
    },
    [approveAndCheckIn, societyId],
  );

  const checkInEntry = useCallback(
    async (entryId: number) => {
      setActiveEntryId(entryId);
      try {
        const response = await checkIn({ societyId, entryId }).unwrap();
        return {
          success: true as const,
          message: response.message ?? "Visitor checked in",
          entry: response.data?.entry,
        };
      } catch (error) {
        return { success: false as const, message: getApiMessage(error, "Could not check in visitor") };
      } finally {
        setActiveEntryId(undefined);
      }
    },
    [checkIn, societyId],
  );

  const checkOutEntry = useCallback(
    async (entryId: number) => {
      setActiveEntryId(entryId);
      try {
        const response = await checkOut({ societyId, entryId }).unwrap();
        return {
          success: true as const,
          message: response.message ?? "Visitor checked out",
          entry: response.data?.entry,
        };
      } catch (error) {
        return { success: false as const, message: getApiMessage(error, "Could not check out visitor") };
      } finally {
        setActiveEntryId(undefined);
      }
    },
    [checkOut, societyId],
  );

  const isLoading =
    notifyState.isLoading ||
    approveState.isLoading ||
    approveAndCheckInState.isLoading ||
    checkInState.isLoading ||
    checkOutState.isLoading;

  return {
    activeEntryId,
    approveAndCheckInEntry,
    approveEntry,
    checkInEntry,
    checkOutEntry,
    isLoading,
    notifyResident,
  };
}
