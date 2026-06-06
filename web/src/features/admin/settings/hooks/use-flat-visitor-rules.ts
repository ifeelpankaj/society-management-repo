"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  type UpdateFlatVisitorSettingArg,
  useGetV1SocietyFlatVisitorSettingsQuery,
  usePatchV1SocietyFlatVisitorSettingMutation,
} from "@/lib/api/society-visitor-settings-api";
import type { VisitorPurpose } from "@/lib/api/visitor-types";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

type UseFlatVisitorRulesOptions = {
  societyId: number;
};

export function useFlatVisitorRules({ societyId }: UseFlatVisitorRulesOptions) {
  const [block, setBlock] = useState("");
  const [purpose, setPurpose] = useState<VisitorPurpose | "all">("all");
  const debouncedBlock = useDebouncedValue(block, 500);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(20);
  const resetKey = [debouncedBlock, purpose].join("\u0000");
  const previousResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (previousResetKeyRef.current !== resetKey) {
      previousResetKeyRef.current = resetKey;
      setPageState(1);
    }
  }, [resetKey]);

  const offset = (page - 1) * pageSize;

  const query = useGetV1SocietyFlatVisitorSettingsQuery({
    societyId,
    block: debouncedBlock.trim() || undefined,
    purpose: purpose === "all" ? undefined : purpose,
    limit: pageSize,
    offset,
  });

  const [patchRule, { isLoading: isUpdating }] =
    usePatchV1SocietyFlatVisitorSettingMutation();

  const rules = query.data?.data?.settings ?? [];
  const total = query.data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(page * pageSize, total);

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(Math.max(1, Math.min(nextPage, totalPages)));
    },
    [totalPages],
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPageState(1);
  }, []);

  const updateRule = useCallback(
    async (
      values: Omit<UpdateFlatVisitorSettingArg, "societyId">,
    ): Promise<boolean> => {
      const toastId = toast.loading("Updating flat visitor rule...");

      try {
        const response = await patchRule({ societyId, ...values }).unwrap();
        toast.success(getApiMessage(response, "Flat rule updated."), {
          id: toastId,
        });
        return true;
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not update flat rule."), {
          id: toastId,
        });
        return false;
      }
    },
    [patchRule, societyId],
  );

  return {
    block,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isUpdating,
    page,
    pageEnd,
    pageSize,
    pageStart,
    purpose,
    refetch: query.refetch,
    rules,
    setBlock,
    setPage,
    setPageSize,
    setPurpose,
    total,
    totalPages,
    updateRule,
  };
}
