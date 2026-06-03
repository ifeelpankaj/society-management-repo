"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  ModelsSocietyResponse,
  ModelsSocietySubscriptionResponse,
} from "@/lib/api/generated-api";
import {
  useGetV1PlansQuery,
  useGetV1SocietiesQuery,
  useGetV1SubscriptionsQuery,
  usePostV1SocietiesBySocietyIdApproveMutation,
  usePostV1SocietiesBySocietyIdSubscriptionsPlansAndPlanIdPendingMutation,
  usePostV1SubscriptionsBySubscriptionIdActivateMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

function pickSubscriptionToActivate(
  subscriptions: ModelsSocietySubscriptionResponse[],
) {
  const pending =
    subscriptions.find((sub) => sub.status === "pending") ?? subscriptions[0];
  if (!pending) return null;

  return pending;
}

export function usePendingSocieties() {
  const societiesQuery = useGetV1SocietiesQuery({
    status: "pending",
    limit: 50,
    offset: 0,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const societies = societiesQuery.data?.data?.societies?.items ?? [];

  const [approveSociety, { isLoading: approving }] =
    usePostV1SocietiesBySocietyIdApproveMutation();

  const [selectedSociety, setSelectedSociety] =
    useState<ModelsSocietyResponse | null>(null);

  const handleApprove = useCallback(
    async (societyId: number) => {
      const toastId = toast.loading("Approving society...");
      try {
        const response = await approveSociety({ societyId }).unwrap();
        toast.success(
          getApiMessage(response, "Society approved successfully."),
          { id: toastId },
        );
        societiesQuery.refetch();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not approve society."), {
          id: toastId,
        });
      }
    },
    [approveSociety, societiesQuery],
  );

  const refetch = useCallback(() => {
    societiesQuery.refetch();
  }, [societiesQuery]);

  return {
    approving,
    handleApprove,
    isError: societiesQuery.isError,
    isFetching: societiesQuery.isFetching,
    isLoading: societiesQuery.isLoading,
    refetch,
    selectedSociety,
    setSelectedSociety,
    societies,
  };
}

type UseSocietySubscriptionOptions = {
  society: ModelsSocietyResponse | null;
  open: boolean;
  onDone?: () => void;
};

export function useSocietySubscription({
  society,
  open,
  onDone,
}: UseSocietySubscriptionOptions) {
  const societyId = society?.id;

  const plansQuery = useGetV1PlansQuery({ isActive: true }, { skip: !open });
  const plans = plansQuery.data?.data?.plans ?? [];

  const subscriptionsQuery = useGetV1SubscriptionsQuery(
    { societyId: societyId ?? undefined },
    { skip: !open || !societyId },
  );
  const subscriptions = subscriptionsQuery.data?.data?.subscriptions ?? [];

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [activateOpen, setActivateOpen] = useState(false);

  const [createPending, { isLoading: creatingPending }] =
    usePostV1SocietiesBySocietyIdSubscriptionsPlansAndPlanIdPendingMutation();
  const [activateSubscription, { isLoading: activating }] =
    usePostV1SubscriptionsBySubscriptionIdActivateMutation();

  const subscriptionToActivate = useMemo(
    () => pickSubscriptionToActivate(subscriptions),
    [subscriptions],
  );

  const busy =
    plansQuery.isFetching ||
    subscriptionsQuery.isFetching ||
    creatingPending ||
    activating;

  const handleCreatePending = useCallback(async () => {
    if (!societyId || !selectedPlanId) return;

    const toastId = toast.loading("Creating pending subscription...");
    try {
      const response = await createPending({
        societyId,
        planId: selectedPlanId,
      }).unwrap();
      toast.success(getApiMessage(response, "Pending subscription created."), {
        id: toastId,
      });
      subscriptionsQuery.refetch();
      onDone?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not create pending subscription."),
        { id: toastId },
      );
    }
  }, [createPending, onDone, selectedPlanId, societyId, subscriptionsQuery]);

  const handleActivate = useCallback(
    async (payload: { starts_at: string; ends_at: string }) => {
      const subscriptionId = subscriptionToActivate?.id;
      if (!subscriptionId) return;

      const toastId = toast.loading("Activating subscription...");
      try {
        const response = await activateSubscription({
          subscriptionId,
          modelsActivateSubscriptionRequest: payload,
        }).unwrap();
        toast.success(getApiMessage(response, "Subscription activated."), {
          id: toastId,
        });
        setActivateOpen(false);
        subscriptionsQuery.refetch();
        onDone?.();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Could not activate subscription."),
          { id: toastId },
        );
      }
    },
    [
      activateSubscription,
      onDone,
      subscriptionToActivate?.id,
      subscriptionsQuery,
    ],
  );

  return {
    activateOpen,
    activating,
    busy,
    handleActivate,
    handleCreatePending,
    plans,
    plansQuery,
    selectedPlanId,
    setActivateOpen,
    setSelectedPlanId,
    subscriptionToActivate,
    subscriptions,
    subscriptionsQuery,
  };
}
