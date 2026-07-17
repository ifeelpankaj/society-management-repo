"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import type { ModelsFlatResidentRole } from "@/lib/api/generated-api";
import {
  useDeleteV1SocietyFlatResidentCustomMutation,
  useGetV1SocietyFlatResidentQuery,
  usePatchV1SocietyFlatResidentRoleCustomMutation,
  usePostV1SocietyFlatResidentMoveOutCustomMutation,
  usePostV1SocietyFlatResidentPrimaryCustomMutation,
} from "@/lib/api/society-flat-residents-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

type UseFlatResidentDetailOptions = {
  societyId: number;
  flatId: number;
  residentId: number;
};

export function useFlatResidentDetail({
  societyId,
  flatId,
  residentId,
}: UseFlatResidentDetailOptions) {
  const residentQuery = useGetV1SocietyFlatResidentQuery({
    societyId,
    flatId,
    residentId,
  });

  const [removeResident, { isLoading: isRemoving }] =
    useDeleteV1SocietyFlatResidentCustomMutation();
  const [moveOutResident, { isLoading: isMovingOut }] =
    usePostV1SocietyFlatResidentMoveOutCustomMutation();
  const [setPrimaryResident, { isLoading: isSettingPrimary }] =
    usePostV1SocietyFlatResidentPrimaryCustomMutation();
  const [updateResidentRole, { isLoading: isUpdatingRole }] =
    usePatchV1SocietyFlatResidentRoleCustomMutation();

  const resident = residentQuery.data?.data?.resident ?? null;
  const busy = isRemoving || isMovingOut || isSettingPrimary || isUpdatingRole;

  const refetch = useCallback(() => {
    residentQuery.refetch();
  }, [residentQuery]);

  const runAction = useCallback(
    async (
      loading: string,
      fallback: string,
      action: () => Promise<{ message?: string }>,
    ) => {
      const toastId = toast.loading(loading);
      try {
        const response = await action();
        toast.success(getApiMessage(response, fallback), { id: toastId });
        refetch();
        return true;
      } catch (error) {
        toast.error(getApiErrorMessage(error, fallback), { id: toastId });
        return false;
      }
    },
    [refetch],
  );

  const handleSetPrimary = useCallback(
    () =>
      runAction(
        "Changing primary resident...",
        "Primary resident changed successfully.",
        () => setPrimaryResident({ societyId, flatId, residentId }).unwrap(),
      ),
    [flatId, residentId, runAction, setPrimaryResident, societyId],
  );

  const handleMoveOut = useCallback(
    () =>
      runAction(
        "Moving out resident...",
        "Resident moved out successfully.",
        () => moveOutResident({ societyId, flatId, residentId }).unwrap(),
      ),
    [flatId, moveOutResident, residentId, runAction, societyId],
  );

  const handleRemove = useCallback(
    () =>
      runAction("Removing resident...", "Resident removed successfully.", () =>
        removeResident({ societyId, flatId, residentId }).unwrap(),
      ),
    [flatId, removeResident, residentId, runAction, societyId],
  );

  const handleUpdateRole = useCallback(
    (role: ModelsFlatResidentRole) =>
      runAction(
        "Updating resident role...",
        "Resident role updated successfully.",
        () =>
          updateResidentRole({
            societyId,
            flatId,
            residentId,
            request: { role },
          }).unwrap(),
      ),
    [flatId, residentId, runAction, societyId, updateResidentRole],
  );

  return {
    busy,
    handleMoveOut,
    handleRemove,
    handleSetPrimary,
    handleUpdateRole,
    isError: residentQuery.isError,
    isLoading: residentQuery.isLoading,
    isFetching: residentQuery.isFetching,
    refetch,
    resident,
  };
}
