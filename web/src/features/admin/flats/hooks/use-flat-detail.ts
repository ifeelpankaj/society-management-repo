"use client";

import { type FormEvent, useCallback } from "react";
import { toast } from "sonner";

import { useFlatMutations } from "@/features/admin/flats/hooks/use-flat-mutations";
import type {
  ModelsFlatResidentResponse,
  ModelsFlatResidentRole,
  ModelsFlatStatus,
} from "@/lib/api/generated-api";
import { useGetV1SocietiesBySocietyIdFlatsAndFlatIdQuery } from "@/lib/api/generated-api";
import {
  useDeleteV1SocietyFlatResidentCustomMutation,
  useGetV1SocietyFlatResidentsQuery,
  usePatchV1SocietyFlatResidentRoleCustomMutation,
  usePostV1SocietyFlatResidentCustomMutation,
  usePostV1SocietyFlatResidentMoveOutCustomMutation,
  usePostV1SocietyFlatResidentPrimaryCustomMutation,
} from "@/lib/api/society-flat-residents-api";
import { useGetV1SocietiesBySocietyIdMembersPaginatedQuery } from "@/lib/api/society-members-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

type UseFlatDetailOptions = {
  societyId: number;
  flatId: number;
  addOpen: boolean;
  memberSearch: string;
};

export function useFlatDetail({
  societyId,
  flatId,
  addOpen,
  memberSearch,
}: UseFlatDetailOptions) {
  const flatQuery = useGetV1SocietiesBySocietyIdFlatsAndFlatIdQuery({
    societyId,
    flatId,
  });
  const residentsQuery = useGetV1SocietyFlatResidentsQuery({
    societyId,
    flatId,
    limit: 100,
  });
  const membersQuery = useGetV1SocietiesBySocietyIdMembersPaginatedQuery(
    {
      societyId,
      search: memberSearch.trim() || undefined,
      status: "active",
      limit: 25,
      offset: 0,
    },
    { skip: !addOpen },
  );

  const flat = flatQuery.data?.data?.flat;
  const residents = residentsQuery.data?.data?.residents ?? [];
  const members = membersQuery.data?.data?.members?.items ?? [];

  const refetch = useCallback(() => {
    flatQuery.refetch();
    residentsQuery.refetch();
    if (addOpen) membersQuery.refetch();
  }, [addOpen, flatQuery, membersQuery, residentsQuery]);

  const flatMutations = useFlatMutations({ societyId, onSuccess: refetch });

  const [addResident, { isLoading: isAddingResident }] =
    usePostV1SocietyFlatResidentCustomMutation();
  const [removeResident, { isLoading: isRemovingResident }] =
    useDeleteV1SocietyFlatResidentCustomMutation();
  const [moveOutResident, { isLoading: isMovingOutResident }] =
    usePostV1SocietyFlatResidentMoveOutCustomMutation();
  const [setPrimaryResident, { isLoading: isSettingPrimary }] =
    usePostV1SocietyFlatResidentPrimaryCustomMutation();
  const [updateResidentRole, { isLoading: isUpdatingResidentRole }] =
    usePatchV1SocietyFlatResidentRoleCustomMutation();

  const busy =
    flatMutations.actionInProgress ||
    isAddingResident ||
    isRemovingResident ||
    isMovingOutResident ||
    isSettingPrimary ||
    isUpdatingResidentRole;

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
      } catch (error) {
        toast.error(getApiErrorMessage(error, fallback), { id: toastId });
      }
    },
    [refetch],
  );

  const handleUpdateFlat = useCallback(
    async (
      event: FormEvent<HTMLFormElement>,
      input: {
        flatNumber: string;
        block: string;
        floor: string;
        status: ModelsFlatStatus;
        isActive: boolean;
      },
      onComplete?: () => void,
    ) => {
      event.preventDefault();
      const success = await flatMutations.handleUpdate(flatId, input, {
        onComplete,
      });
      if (success) onComplete?.();
    },
    [flatId, flatMutations],
  );

  const handleBlockToggle = useCallback(async () => {
    if (!flat) return;
    await flatMutations.handleBlockToggle(flat);
  }, [flat, flatMutations]);

  const handleDeactivate = useCallback(
    async (onComplete?: () => void) => {
      await flatMutations.handleDeactivate(flatId, { onComplete });
    },
    [flatId, flatMutations],
  );

  const handleAddResident = useCallback(
    async (
      event: FormEvent<HTMLFormElement>,
      input: {
        userId: number;
        role: ModelsFlatResidentRole;
        isPrimary: boolean;
      },
      onComplete?: () => void,
    ) => {
      event.preventDefault();
      if (!Number.isSafeInteger(input.userId) || input.userId <= 0) {
        toast.error("Select a member to add.");
        return;
      }

      await runAction(
        "Adding resident...",
        "Resident added successfully.",
        () =>
          addResident({
            societyId,
            flatId,
            userId: input.userId,
            request: { role: input.role, is_primary: input.isPrimary },
          }).unwrap(),
      );
      onComplete?.();
    },
    [addResident, flatId, runAction, societyId],
  );

  const handleUpdateResidentRole = useCallback(
    async (
      event: FormEvent<HTMLFormElement>,
      resident: ModelsFlatResidentResponse,
      role: ModelsFlatResidentRole,
      onComplete?: () => void,
    ) => {
      event.preventDefault();
      if (!resident.id) return;

      await runAction(
        "Updating resident role...",
        "Resident role updated successfully.",
        () =>
          updateResidentRole({
            societyId,
            flatId,
            residentId: resident.id ?? 0,
            request: { role },
          }).unwrap(),
      );
      onComplete?.();
    },
    [flatId, runAction, societyId, updateResidentRole],
  );

  const handleSetPrimaryResident = useCallback(
    (residentId: number) =>
      runAction(
        "Changing primary resident...",
        "Primary resident changed successfully.",
        () => setPrimaryResident({ societyId, flatId, residentId }).unwrap(),
      ),
    [flatId, runAction, setPrimaryResident, societyId],
  );

  const handleMoveOutResident = useCallback(
    (residentId: number) =>
      runAction(
        "Moving out resident...",
        "Resident moved out successfully.",
        () => moveOutResident({ societyId, flatId, residentId }).unwrap(),
      ),
    [flatId, moveOutResident, runAction, societyId],
  );

  const handleRemoveResident = useCallback(
    (residentId: number) =>
      runAction("Removing resident...", "Resident removed successfully.", () =>
        removeResident({ societyId, flatId, residentId }).unwrap(),
      ),
    [flatId, removeResident, runAction, societyId],
  );

  return {
    busy,
    flat,
    flatQuery,
    handleAddResident,
    handleBlockToggle,
    handleDeactivate,
    handleMoveOutResident,
    handleRemoveResident,
    handleSetPrimaryResident,
    handleUpdateFlat,
    handleUpdateResidentRole,
    isAddingResident,
    isUpdating: flatMutations.isUpdating,
    isUpdatingResidentRole,
    members,
    membersQuery,
    refetch,
    residents,
    residentsQuery,
    runAction,
  };
}
