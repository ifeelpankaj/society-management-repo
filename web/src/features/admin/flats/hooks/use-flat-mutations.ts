"use client";

import { type FormEvent, useCallback } from "react";
import { toast } from "sonner";

import type {
  ModelsFlatResponse,
  ModelsFlatStatus,
} from "@/lib/api/generated-api";
import {
  useDeleteV1SocietiesBySocietyIdFlatsAndFlatIdMutation,
  usePatchV1SocietiesBySocietyIdFlatsAndFlatIdMutation,
  usePostV1SocietiesBySocietyIdFlatsAndFlatIdBlockMutation,
  usePostV1SocietiesBySocietyIdFlatsAndFlatIdUnblockMutation,
  usePostV1SocietiesBySocietyIdFlatsMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

type FlatUpdateInput = {
  flatNumber: string;
  block: string;
  floor: string;
  status: ModelsFlatStatus;
  isActive: boolean;
};

type UseFlatMutationsOptions = {
  societyId: number;
  onSuccess?: () => void;
};

export function useFlatMutations({
  societyId,
  onSuccess,
}: UseFlatMutationsOptions) {
  const [updateFlat, { isLoading: isUpdating }] =
    usePatchV1SocietiesBySocietyIdFlatsAndFlatIdMutation();
  const [blockFlat, { isLoading: isBlocking }] =
    usePostV1SocietiesBySocietyIdFlatsAndFlatIdBlockMutation();
  const [unblockFlat, { isLoading: isUnblocking }] =
    usePostV1SocietiesBySocietyIdFlatsAndFlatIdUnblockMutation();
  const [deactivateFlat, { isLoading: isDeactivating }] =
    useDeleteV1SocietiesBySocietyIdFlatsAndFlatIdMutation();
  const [createFlat, { isLoading: isCreating }] =
    usePostV1SocietiesBySocietyIdFlatsMutation();

  const actionInProgress =
    isUpdating || isBlocking || isUnblocking || isDeactivating || isCreating;

  const handleUpdate = useCallback(
    async (
      flatId: number,
      input: FlatUpdateInput,
      options?: { onComplete?: () => void },
    ) => {
      if (!input.flatNumber.trim()) {
        toast.error("Flat number is required.");
        return false;
      }

      const toastId = toast.loading("Updating flat...");

      try {
        const response = await updateFlat({
          societyId,
          flatId,
          modelsUpdateFlatRequest: {
            flat_number: input.flatNumber.trim(),
            block: input.block.trim() || undefined,
            floor: input.floor.trim() || undefined,
            status: input.status,
            is_active: input.isActive,
          },
        }).unwrap();

        toast.success(getApiMessage(response, "Flat updated successfully."), {
          id: toastId,
        });
        onSuccess?.();
        options?.onComplete?.();
        return true;
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not update flat."), {
          id: toastId,
        });
        return false;
      }
    },
    [onSuccess, societyId, updateFlat],
  );

  const handleBlockToggle = useCallback(
    async (flat: ModelsFlatResponse) => {
      if (!flat.id) return;

      const blocked = flat.status === "blocked";
      const toastId = toast.loading(
        blocked ? "Unblocking flat..." : "Blocking flat...",
      );

      try {
        const response = blocked
          ? await unblockFlat({ societyId, flatId: flat.id }).unwrap()
          : await blockFlat({ societyId, flatId: flat.id }).unwrap();

        toast.success(
          getApiMessage(
            response,
            blocked
              ? "Flat unblocked successfully."
              : "Flat blocked successfully.",
          ),
          { id: toastId },
        );
        onSuccess?.();
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            blocked ? "Could not unblock flat." : "Could not block flat.",
          ),
          { id: toastId },
        );
      }
    },
    [blockFlat, onSuccess, societyId, unblockFlat],
  );

  const handleDeactivate = useCallback(
    async (flatId: number, options?: { onComplete?: () => void }) => {
      const toastId = toast.loading("Deactivating flat...");

      try {
        const response = await deactivateFlat({ societyId, flatId }).unwrap();

        toast.success(
          getApiMessage(response, "Flat deactivated successfully."),
          {
            id: toastId,
          },
        );
        onSuccess?.();
        options?.onComplete?.();
        return true;
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not deactivate flat."), {
          id: toastId,
        });
        return false;
      }
    },
    [deactivateFlat, onSuccess, societyId],
  );

  const handleCreate = useCallback(
    async (
      event: FormEvent<HTMLFormElement>,
      input: { flatNumber: string; block: string; floor: string },
    ) => {
      event.preventDefault();

      if (!input.flatNumber.trim()) {
        toast.error("Flat number is required.");
        return false;
      }

      const toastId = toast.loading("Creating flat...");

      try {
        const response = await createFlat({
          societyId,
          modelsCreateFlatRequest: {
            flat_number: input.flatNumber.trim(),
            block: input.block.trim() || undefined,
            floor: input.floor.trim() || undefined,
          },
        }).unwrap();

        toast.success(getApiMessage(response, "Flat created successfully."), {
          id: toastId,
        });
        return true;
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not create flat."), {
          id: toastId,
        });
        return false;
      }
    },
    [createFlat, societyId],
  );

  return {
    actionInProgress,
    handleBlockToggle,
    handleCreate,
    handleDeactivate,
    handleUpdate,
    isBlocking,
    isCreating,
    isDeactivating,
    isUnblocking,
    isUpdating,
  };
}

export type { FlatUpdateInput };
