"use client";

import {
  Ban,
  CheckCircle2,
  CreditCard,
  Edit3,
  RotateCcw,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";
import { type ComponentProps, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type ModelsPlanResponse,
  type ModelsSocietyDetailResponse,
  type ModelsSocietySubscriptionResponse,
  useDeleteV1SocietiesBySocietyIdMutation,
  useGetV1PlansQuery,
  useGetV1SocietiesBySocietyIdQuery,
  useGetV1SubscriptionsQuery,
  usePatchV1SocietiesBySocietyIdMutation,
  usePostV1SocietiesBySocietyIdApproveMutation,
  usePostV1SocietiesBySocietyIdReactivateMutation,
  usePostV1SocietiesBySocietyIdRejectMutation,
  usePostV1SocietiesBySocietyIdRestoreMutation,
  usePostV1SocietiesBySocietyIdSubscriptionsPlansAndPlanIdPendingMutation,
  usePostV1SocietiesBySocietyIdSuspendMutation,
  usePostV1SubscriptionsBySubscriptionIdActivateMutation,
  usePostV1SubscriptionsBySubscriptionIdCancelMutation,
  usePostV1SubscriptionsBySubscriptionIdExpireMutation,
  usePostV1SubscriptionsBySubscriptionIdPlansAndPlanIdMutation,
  usePostV1SubscriptionsBySubscriptionIdRenewMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import {
  formatMoney,
  formatNumberIN,
  formatShortDateIN,
  titleCaseFromSnake,
} from "@/lib/format";

import { SocietyStatusBadge } from "./society-status-badge";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type SocietyDetailClientProps = {
  societyId: number;
};

type SocietyFormState = {
  address_line1: string;
  address_line2: string;
  city: string;
  country: string;
  email: string;
  landmark: string;
  name: string;
  phone_number: string;
  pincode: string;
  state: string;
  total_blocks: string;
  total_flats: string;
};

type ReasonAction = "reject" | "suspend" | null;
type SubscriptionAction = "create" | "activate" | "renew" | "change" | "cancel";
type SubscriptionDialogState = {
  action: SubscriptionAction;
  subscription?: ModelsSocietySubscriptionResponse;
} | null;

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toApiDateTime(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function addBillingCycle(startDate: Date, billingCycle?: string) {
  const endDate = new Date(startDate);

  if (billingCycle === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate;
  }

  endDate.setMonth(endDate.getMonth() + 1);
  return endDate;
}

function toSocietyFormState(
  society?: ModelsSocietyDetailResponse,
): SocietyFormState {
  return {
    address_line1: society?.address_line1 ?? "",
    address_line2: society?.address_line2 ?? "",
    city: society?.city ?? "",
    country: society?.country ?? "",
    email: society?.email ?? "",
    landmark: society?.landmark ?? "",
    name: society?.name ?? "",
    phone_number: society?.phone_number ?? "",
    pincode: society?.pincode ?? "",
    state: society?.state ?? "",
    total_blocks:
      society?.total_blocks === undefined ? "" : String(society.total_blocks),
    total_flats:
      society?.total_flats === undefined ? "" : String(society.total_flats),
  };
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function optionalNumber(value: string) {
  if (!value.trim()) return undefined;
  return Number(value);
}

function planLabel(plan: ModelsPlanResponse) {
  return [
    plan.name ?? "Unnamed plan",
    plan.billing_cycle ? titleCaseFromSnake(plan.billing_cycle) : null,
    formatMoney(plan.price_amount_paise, plan.currency),
  ]
    .filter(Boolean)
    .join(" - ");
}

export function SocietyDetailClient({ societyId }: SocietyDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<SocietyFormState>(
    toSocietyFormState(),
  );
  const [reasonAction, setReasonAction] = useState<ReasonAction>(null);
  const [reason, setReason] = useState("");
  const [subscriptionDialog, setSubscriptionDialog] =
    useState<SubscriptionDialogState>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const societyQuery = useGetV1SocietiesBySocietyIdQuery(
    { societyId },
    { skip: false },
  );
  const subscriptionsQuery = useGetV1SubscriptionsQuery(
    { societyId },
    { skip: false },
  );
  const plansQuery = useGetV1PlansQuery({
    isActive: true,
    limit: 100,
    offset: 0,
  });

  const [updateSociety, { isLoading: isUpdating }] =
    usePatchV1SocietiesBySocietyIdMutation();
  const [approveSociety, { isLoading: isApproving }] =
    usePostV1SocietiesBySocietyIdApproveMutation();
  const [rejectSociety, { isLoading: isRejecting }] =
    usePostV1SocietiesBySocietyIdRejectMutation();
  const [suspendSociety, { isLoading: isSuspending }] =
    usePostV1SocietiesBySocietyIdSuspendMutation();
  const [reactivateSociety, { isLoading: isReactivating }] =
    usePostV1SocietiesBySocietyIdReactivateMutation();
  const [deleteSociety, { isLoading: isDeleting }] =
    useDeleteV1SocietiesBySocietyIdMutation();
  const [restoreSociety, { isLoading: isRestoring }] =
    usePostV1SocietiesBySocietyIdRestoreMutation();
  const [createPendingSubscription, { isLoading: isCreatingPending }] =
    usePostV1SocietiesBySocietyIdSubscriptionsPlansAndPlanIdPendingMutation();
  const [activateSubscription, { isLoading: isActivating }] =
    usePostV1SubscriptionsBySubscriptionIdActivateMutation();
  const [renewSubscription, { isLoading: isRenewing }] =
    usePostV1SubscriptionsBySubscriptionIdRenewMutation();
  const [changePlan, { isLoading: isChangingPlan }] =
    usePostV1SubscriptionsBySubscriptionIdPlansAndPlanIdMutation();
  const [expireSubscription, { isLoading: isExpiring }] =
    usePostV1SubscriptionsBySubscriptionIdExpireMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    usePostV1SubscriptionsBySubscriptionIdCancelMutation();

  const society = societyQuery.data?.data?.society;
  const subscriptions = subscriptionsQuery.data?.data?.subscriptions ?? [];
  const plans = plansQuery.data?.data?.plans ?? [];
  const selectedPlan = plans.find((plan) => String(plan.id) === selectedPlanId);
  const selectedSubscription = subscriptionDialog?.subscription;
  const lifecycleLoading =
    isApproving ||
    isRejecting ||
    isSuspending ||
    isReactivating ||
    isDeleting ||
    isRestoring;
  const subscriptionLoading =
    isCreatingPending ||
    isActivating ||
    isRenewing ||
    isChangingPlan ||
    isExpiring ||
    isCancelling;

  const activeSubscription = useMemo(
    () =>
      subscriptions.find((subscription) => subscription.status === "active") ??
      subscriptions.find((subscription) => subscription.status === "trial") ??
      subscriptions.find((subscription) => subscription.status === "pending"),
    [subscriptions],
  );

  useEffect(() => {
    if (society && !isEditing) {
      setFormState(toSocietyFormState(society));
    }
  }, [society, isEditing]);

  useEffect(() => {
    if (!subscriptionDialog) return;
    if (!startsAt) return;

    const billingCycle =
      selectedPlan?.billing_cycle ?? selectedSubscription?.billing_cycle;
    setEndsAt(
      toDateInputValue(addBillingCycle(new Date(startsAt), billingCycle)),
    );
  }, [selectedPlan, selectedSubscription, startsAt, subscriptionDialog]);

  const refetchAll = () => {
    societyQuery.refetch();
    subscriptionsQuery.refetch();
    plansQuery.refetch();
  };

  const updateField = (field: keyof SocietyFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const openSubscriptionDialog = (
    action: SubscriptionAction,
    subscription?: ModelsSocietySubscriptionResponse,
  ) => {
    const startDate = new Date();
    const billingCycle = subscription?.billing_cycle;

    setSubscriptionDialog({ action, subscription });
    setSelectedPlanId(
      subscription?.plan_id ? String(subscription.plan_id) : "",
    );
    setStartsAt(toDateInputValue(startDate));
    setEndsAt(toDateInputValue(addBillingCycle(startDate, billingCycle)));
    setReason("");
  };

  const closeSubscriptionDialog = () => {
    if (subscriptionLoading) return;
    setSubscriptionDialog(null);
    setSelectedPlanId("");
    setStartsAt("");
    setEndsAt("");
    setReason("");
  };

  const handleUpdateSociety = async (event: FormSubmitEvent) => {
    event.preventDefault();
    if (!societyId) return;

    if (!formState.name.trim()) {
      toast.error("Society name is required.");
      return;
    }

    const totalBlocks = optionalNumber(formState.total_blocks);
    const totalFlats = optionalNumber(formState.total_flats);
    if (
      (totalBlocks !== undefined && totalBlocks < 0) ||
      (totalFlats !== undefined && totalFlats < 0)
    ) {
      toast.error("Blocks and flats cannot be negative.");
      return;
    }

    const toastId = toast.loading("Updating society...");

    try {
      const response = await updateSociety({
        societyId,
        modelsUpdateSocietyRequest: {
          address_line1: optionalString(formState.address_line1),
          address_line2: optionalString(formState.address_line2),
          city: optionalString(formState.city),
          country: optionalString(formState.country),
          email: optionalString(formState.email),
          landmark: optionalString(formState.landmark),
          name: formState.name.trim(),
          phone_number: optionalString(formState.phone_number),
          pincode: optionalString(formState.pincode),
          state: optionalString(formState.state),
          total_blocks: totalBlocks,
          total_flats: totalFlats,
        },
      }).unwrap();
      toast.success(getApiMessage(response, "Society updated."), {
        id: toastId,
      });
      setIsEditing(false);
      societyQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update society."), {
        id: toastId,
      });
    }
  };

  const runLifecycleAction = async (
    label: string,
    action: () => Promise<{ message?: string }>,
  ) => {
    const toastId = toast.loading(`${label}...`);

    try {
      const response = await action();
      toast.success(getApiMessage(response, `${label} completed.`), {
        id: toastId,
      });
      setReasonAction(null);
      setReason("");
      societyQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, `${label} failed.`), {
        id: toastId,
      });
    }
  };

  const handleReasonAction = async (event: FormSubmitEvent) => {
    event.preventDefault();
    if (!societyId || !reasonAction) return;
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.error("Reason is required.");
      return;
    }

    if (reasonAction === "reject") {
      await runLifecycleAction("Rejecting society", () =>
        rejectSociety({
          societyId,
          modelsSocietyReasonRequest: { reason: trimmedReason },
        }).unwrap(),
      );
      return;
    }

    await runLifecycleAction("Suspending society", () =>
      suspendSociety({
        societyId,
        modelsSocietyReasonRequest: { reason: trimmedReason },
      }).unwrap(),
    );
  };

  const handleSubscriptionSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();
    if (!societyId || !subscriptionDialog) return;

    if (
      subscriptionDialog.action === "create" ||
      subscriptionDialog.action === "change"
    ) {
      if (!selectedPlan?.id) {
        toast.error("Select a subscription plan.");
        return;
      }
    }

    if (
      subscriptionDialog.action === "create" ||
      subscriptionDialog.action === "activate" ||
      subscriptionDialog.action === "renew"
    ) {
      if (!startsAt || !endsAt) {
        toast.error("Start and end dates are required.");
        return;
      }
    }

    if (subscriptionDialog.action === "cancel" && !reason.trim()) {
      toast.error("Cancellation reason is required.");
      return;
    }

    const toastId = toast.loading("Updating subscription...");

    try {
      if (subscriptionDialog.action === "create" && selectedPlan?.id) {
        const pendingResponse = await createPendingSubscription({
          societyId,
          planId: selectedPlan.id,
        }).unwrap();
        const subscriptionId = pendingResponse.data?.subscription?.id;

        if (!subscriptionId) {
          throw new Error("Subscription ID was not returned by the API.");
        }

        await activateSubscription({
          subscriptionId,
          modelsActivateSubscriptionRequest: {
            starts_at: toApiDateTime(startsAt),
            ends_at: toApiDateTime(endsAt),
          },
        }).unwrap();
      }

      if (
        subscriptionDialog.action === "activate" &&
        selectedSubscription?.id
      ) {
        await activateSubscription({
          subscriptionId: selectedSubscription.id,
          modelsActivateSubscriptionRequest: {
            starts_at: toApiDateTime(startsAt),
            ends_at: toApiDateTime(endsAt),
          },
        }).unwrap();
      }

      if (subscriptionDialog.action === "renew" && selectedSubscription?.id) {
        await renewSubscription({
          subscriptionId: selectedSubscription.id,
          modelsRenewSubscriptionRequest: {
            starts_at: toApiDateTime(startsAt),
            ends_at: toApiDateTime(endsAt),
          },
        }).unwrap();
      }

      if (
        subscriptionDialog.action === "change" &&
        selectedSubscription?.id &&
        selectedPlan?.id
      ) {
        await changePlan({
          subscriptionId: selectedSubscription.id,
          planId: selectedPlan.id,
        }).unwrap();
      }

      if (subscriptionDialog.action === "cancel" && selectedSubscription?.id) {
        await cancelSubscription({
          subscriptionId: selectedSubscription.id,
          modelsCancelSubscriptionRequest: { reason: reason.trim() },
        }).unwrap();
      }

      toast.success("Subscription updated.", { id: toastId });
      closeSubscriptionDialog();
      subscriptionsQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update subscription."), {
        id: toastId,
      });
    }
  };

  const handleExpire = async (
    subscription: ModelsSocietySubscriptionResponse,
  ) => {
    if (!subscription.id) return;
    const toastId = toast.loading("Expiring subscription...");

    try {
      const response = await expireSubscription({
        subscriptionId: subscription.id,
      }).unwrap();
      toast.success(getApiMessage(response, "Subscription expired."), {
        id: toastId,
      });
      subscriptionsQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not expire subscription."), {
        id: toastId,
      });
    }
  };

  return (
    <WorkspacePage>
      <BackLink href="/developer/societies" label="Back to societies" />
      <PageHeader
        actions={
          <RefreshButton
            loading={societyQuery.isFetching || subscriptionsQuery.isFetching}
            onClick={refetchAll}
          />
        }
        description="Manage society profile, status, and subscriptions from one developer workspace."
        title={
          <span className="flex flex-wrap items-center gap-3">
            {society?.name ?? "Society details"}
            <SocietyStatusBadge status={society?.status} />
          </span>
        }
      />

      <AsyncPanel
        error={
          !societyQuery.isLoading && !society
            ? "Refresh the page or open another society from the directory."
            : null
        }
        loading={societyQuery.isLoading}
        loadingDescription="Loading society profile and subscription data."
        loadingLabel="Loading society"
        onRetry={refetchAll}
      >
        {society ? (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    {formatNumberIN(society.total_flats)}
                  </CardTitle>
                  <CardDescription>Flats</CardDescription>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    {formatNumberIN(society.total_blocks)}
                  </CardTitle>
                  <CardDescription>Blocks</CardDescription>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    {formatNumberIN(society.members_count)}
                  </CardTitle>
                  <CardDescription>Members</CardDescription>
                </CardHeader>
              </Card>
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    {activeSubscription?.status
                      ? titleCaseFromSnake(activeSubscription.status)
                      : "None"}
                  </CardTitle>
                  <CardDescription>Subscription</CardDescription>
                </CardHeader>
              </Card>
            </section>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Society Details</CardTitle>
                  <CardDescription>
                    {society.society_code ?? "Code not generated"} - created{" "}
                    {formatShortDateIN(society.created_at)}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setIsEditing((current) => !current);
                    setFormState(toSocietyFormState(society));
                  }}
                  type="button"
                  variant="outline"
                >
                  <Edit3 className="size-4" />
                  {isEditing ? "Cancel edit" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleUpdateSociety}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      disabled={!isEditing}
                      placeholder="Society name"
                      value={formState.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="Email"
                      value={formState.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="Phone number"
                      value={formState.phone_number}
                      onChange={(event) =>
                        updateField("phone_number", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="Address line 1"
                      value={formState.address_line1}
                      onChange={(event) =>
                        updateField("address_line1", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="Address line 2"
                      value={formState.address_line2}
                      onChange={(event) =>
                        updateField("address_line2", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="Landmark"
                      value={formState.landmark}
                      onChange={(event) =>
                        updateField("landmark", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="City"
                      value={formState.city}
                      onChange={(event) =>
                        updateField("city", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="State"
                      value={formState.state}
                      onChange={(event) =>
                        updateField("state", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="Country"
                      value={formState.country}
                      onChange={(event) =>
                        updateField("country", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      placeholder="Pincode"
                      value={formState.pincode}
                      onChange={(event) =>
                        updateField("pincode", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      min={0}
                      placeholder="Total blocks"
                      type="number"
                      value={formState.total_blocks}
                      onChange={(event) =>
                        updateField("total_blocks", event.target.value)
                      }
                    />
                    <Input
                      disabled={!isEditing}
                      min={0}
                      placeholder="Total flats"
                      type="number"
                      value={formState.total_flats}
                      onChange={(event) =>
                        updateField("total_flats", event.target.value)
                      }
                    />
                  </div>
                  {isEditing ? (
                    <div className="flex justify-end">
                      <Button disabled={isUpdating} type="submit">
                        <Save className="size-4" />
                        Save changes
                      </Button>
                    </div>
                  ) : null}
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lifecycle</CardTitle>
                <CardDescription>
                  Approve, reject, suspend, reactivate, delete, or restore this
                  society.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  disabled={lifecycleLoading || society.status === "active"}
                  onClick={() =>
                    runLifecycleAction("Approving society", () =>
                      approveSociety({ societyId }).unwrap(),
                    )
                  }
                  type="button"
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </Button>
                <Button
                  disabled={lifecycleLoading || society.status === "rejected"}
                  onClick={() => setReasonAction("reject")}
                  type="button"
                  variant="outline"
                >
                  <XCircle className="size-4" />
                  Reject
                </Button>
                <Button
                  disabled={lifecycleLoading || society.status === "suspended"}
                  onClick={() => setReasonAction("suspend")}
                  type="button"
                  variant="outline"
                >
                  <Ban className="size-4" />
                  Suspend
                </Button>
                <Button
                  disabled={lifecycleLoading || society.status === "active"}
                  onClick={() =>
                    runLifecycleAction("Reactivating society", () =>
                      reactivateSociety({ societyId }).unwrap(),
                    )
                  }
                  type="button"
                  variant="outline"
                >
                  <RotateCcw className="size-4" />
                  Reactivate
                </Button>
                <Button
                  disabled={lifecycleLoading}
                  onClick={() =>
                    runLifecycleAction("Deleting society", () =>
                      deleteSociety({ societyId }).unwrap(),
                    )
                  }
                  type="button"
                  variant="outline"
                >
                  <Trash2 className="size-4" />
                  Soft delete
                </Button>
                <Button
                  disabled={lifecycleLoading}
                  onClick={() =>
                    runLifecycleAction("Restoring society", () =>
                      restoreSociety({ societyId }).unwrap(),
                    )
                  }
                  type="button"
                  variant="outline"
                >
                  <RotateCcw className="size-4" />
                  Restore
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Subscriptions</CardTitle>
                  <CardDescription>
                    Create, activate, renew, change, expire, or cancel
                    subscriptions for this society.
                  </CardDescription>
                </div>
                <Button
                  disabled={plansQuery.isLoading}
                  onClick={() => openSubscriptionDialog("create")}
                  type="button"
                >
                  <CreditCard className="size-4" />
                  Create and activate
                </Button>
              </CardHeader>
              <CardContent>
                {subscriptions.length > 0 ? (
                  <div className="divide-y divide-border rounded-lg border border-border">
                    {subscriptions.map((subscription) => (
                      <div
                        className="grid gap-3 p-4 lg:grid-cols-[1fr_auto]"
                        key={subscription.id}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CreditCard className="size-4 text-muted-foreground" />
                            <p className="truncate font-medium">
                              {subscription.plan_name ?? "Unnamed plan"}
                            </p>
                            <Badge variant="secondary">
                              {titleCaseFromSnake(subscription.status)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {subscription.plan_code ?? "No plan code"} -{" "}
                            {formatMoney(
                              subscription.price_amount_paise,
                              subscription.currency,
                            )}{" "}
                            - {formatShortDateIN(subscription.starts_at)} to{" "}
                            {formatShortDateIN(subscription.ends_at)}
                          </p>
                          <div className="flex flex-wrap gap-3 text-muted-foreground text-sm">
                            <span>
                              {formatNumberIN(subscription.max_flats)} flats
                            </span>
                            <span>
                              {formatNumberIN(subscription.max_residents)}{" "}
                              residents
                            </span>
                            <span>
                              {formatNumberIN(subscription.max_admins)} admins
                            </span>
                            <span>
                              {formatNumberIN(subscription.max_staff)} staff
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            disabled={
                              !subscription.id ||
                              subscription.status === "active" ||
                              subscriptionLoading
                            }
                            onClick={() =>
                              openSubscriptionDialog("activate", subscription)
                            }
                            size="sm"
                            type="button"
                          >
                            Activate
                          </Button>
                          <Button
                            disabled={!subscription.id || subscriptionLoading}
                            onClick={() =>
                              openSubscriptionDialog("renew", subscription)
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            Renew
                          </Button>
                          <Button
                            disabled={!subscription.id || subscriptionLoading}
                            onClick={() =>
                              openSubscriptionDialog("change", subscription)
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            Change plan
                          </Button>
                          <Button
                            disabled={!subscription.id || subscriptionLoading}
                            onClick={() => handleExpire(subscription)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            Expire
                          </Button>
                          <Button
                            disabled={!subscription.id || subscriptionLoading}
                            onClick={() =>
                              openSubscriptionDialog("cancel", subscription)
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No subscriptions found"
                    description="Create and activate a subscription for this society."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </AsyncPanel>

      <Dialog
        open={!!reasonAction}
        onOpenChange={(open) => {
          if (!open) {
            setReasonAction(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reasonAction === "reject" ? "Reject Society" : "Suspend Society"}
            </DialogTitle>
            <DialogDescription>
              A reason is required for this lifecycle action.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleReasonAction}>
            <Input
              autoFocus
              placeholder="Reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReasonAction(null);
                  setReason("");
                }}
              >
                Cancel
              </Button>
              <Button disabled={isRejecting || isSuspending} type="submit">
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!subscriptionDialog}
        onOpenChange={(open) => {
          if (!open) closeSubscriptionDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {subscriptionDialog?.action === "create"
                ? "Create and Activate Subscription"
                : subscriptionDialog?.action === "activate"
                  ? "Activate Subscription"
                  : subscriptionDialog?.action === "renew"
                    ? "Renew Subscription"
                    : subscriptionDialog?.action === "change"
                      ? "Change Plan"
                      : "Cancel Subscription"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubscription?.plan_name ??
                "Choose the plan and subscription dates."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubscriptionSubmit}>
            {subscriptionDialog?.action === "create" ||
            subscriptionDialog?.action === "change" ? (
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
                value={selectedPlanId}
                onChange={(event) => setSelectedPlanId(event.target.value)}
              >
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {planLabel(plan)}
                  </option>
                ))}
              </select>
            ) : null}

            {subscriptionDialog?.action === "create" ||
            subscriptionDialog?.action === "activate" ||
            subscriptionDialog?.action === "renew" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  type="date"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
                <Input
                  type="date"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                />
              </div>
            ) : null}

            {subscriptionDialog?.action === "cancel" ? (
              <Input
                autoFocus
                placeholder="Cancellation reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            ) : null}

            <DialogFooter>
              <Button
                disabled={subscriptionLoading}
                type="button"
                variant="outline"
                onClick={closeSubscriptionDialog}
              >
                Cancel
              </Button>
              <Button disabled={subscriptionLoading} type="submit">
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
