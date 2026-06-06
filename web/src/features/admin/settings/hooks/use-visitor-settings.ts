"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import {
  type UpdateSocietyVisitorSettingsArg,
  useGetV1SocietyVisitorSettingsQuery,
  usePatchV1SocietyVisitorSettingsMutation,
} from "@/lib/api/society-visitor-settings-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

type UseVisitorSettingsOptions = {
  societyId: number;
};

export function useVisitorSettings({ societyId }: UseVisitorSettingsOptions) {
  const query = useGetV1SocietyVisitorSettingsQuery({ societyId });
  const [patchSettings, { isLoading: isSaving }] =
    usePatchV1SocietyVisitorSettingsMutation();

  const settings = query.data?.data?.visitor_settings;

  const saveSettings = useCallback(
    async (values: Omit<UpdateSocietyVisitorSettingsArg, "societyId">) => {
      const toastId = toast.loading("Saving visitor settings...");

      try {
        const response = await patchSettings({ societyId, ...values }).unwrap();
        toast.success(
          getApiMessage(response, "Visitor settings saved."),
          { id: toastId },
        );
        return true;
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Could not save visitor settings."),
          { id: toastId },
        );
        return false;
      }
    },
    [patchSettings, societyId],
  );

  return {
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isSaving,
    refetch: query.refetch,
    saveSettings,
    settings,
  };
}
