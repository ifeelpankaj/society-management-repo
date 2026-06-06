"use client";

import { CreditCard } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  addBillingCycle,
  toApiDateTime,
  toDateInputValue,
} from "@/features/developer/subscription-lifecycle/subscription-dates";
import {
  ActionPanel,
  ConfirmReasonDialog,
  DangerZone,
  DetailPageLayout,
  StatusHero,
  TimelineCard,
} from "@/features/shared/detail-page";
import {
  useGetV1PlansQuery,
  useGetV1SubscriptionsLookupQuery,
  usePostV1SubscriptionsBySubscriptionIdActivateMutation,
  usePostV1SubscriptionsBySubscriptionIdCancelMutation,
  usePostV1SubscriptionsBySubscriptionIdExpireMutation,
  usePostV1SubscriptionsBySubscriptionIdPlansAndPlanIdMutation,
  usePostV1SubscriptionsBySubscriptionIdRenewMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { formatMoney, formatNumberIN, titleCaseFromSnake } from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type SubscriptionDetailClientProps = {
  subscriptionId: number;
};

type DialogAction = "activate" | "renew" | "change" | "cancel" | null;

export function SubscriptionDetailClient({
  subscriptionId,
}: SubscriptionDetailClientProps) {
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const lookupQuery = useGetV1SubscriptionsLookupQuery({ id: subscriptionId });
  const subscription = lookupQuery.data?.data?.subscription;
  const plansQuery = useGetV1PlansQuery({
    isActive: true,
    limit: 100,
    offset: 0,
  });
  const plans = plansQuery.data?.data?.plans ?? [];
  const selectedPlan = plans.find((plan) => String(plan.id) === selectedPlanId);

  const [activateSubscription, { isLoading: isActivating }] =
    usePostV1SubscriptionsBySubscriptionIdActivateMutation();
  const [renewSubscription, { isLoading: isRenewing }] =
    usePostV1SubscriptionsBySubscriptionIdRenewMutation();
  const [changePlan, { isLoading: isChangingPlan }] =
    usePostV1SubscriptionsBySubscriptionIdPlansAndPlanIdMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    usePostV1SubscriptionsBySubscriptionIdCancelMutation();
  const [expireSubscription, { isLoading: isExpiring }] =
    usePostV1SubscriptionsBySubscriptionIdExpireMutation();

  const busy =
    isActivating || isRenewing || isChangingPlan || isCancelling || isExpiring;

  const timelineItems = useMemo(
    () => [
      { id: "starts", label: "Period start", value: subscription?.starts_at },
      { id: "ends", label: "Period end", value: subscription?.ends_at },
      {
        id: "trial",
        label: "Trial ends",
        value: subscription?.trial_ends_at,
      },
      {
        id: "cancelled",
        label: "Cancelled at",
        value: subscription?.cancelled_at,
      },
    ],
    [subscription],
  );

  useEffect(() => {
    if (!dialogAction || !selectedPlan) return;
    if (dialogAction === "change") return;
    if (!startsAt) {
      const start = new Date();
      setStartsAt(toDateInputValue(start));
      setEndsAt(
        toDateInputValue(
          addBillingCycle(
            start,
            selectedPlan.billing_cycle ?? subscription?.billing_cycle,
          ),
        ),
      );
    }
  }, [dialogAction, selectedPlan, startsAt, subscription?.billing_cycle]);

  useEffect(() => {
    if (!startsAt || !selectedPlan || dialogAction === "change") return;
    setEndsAt(
      toDateInputValue(
        addBillingCycle(new Date(startsAt), selectedPlan.billing_cycle),
      ),
    );
  }, [dialogAction, selectedPlan, startsAt]);

  function openDialog(action: DialogAction) {
    setDialogAction(action);
    setSelectedPlanId(
      action === "change" ? "" : String(subscription?.plan_id ?? ""),
    );
    const start = new Date();
    setStartsAt(toDateInputValue(start));
    setEndsAt(
      toDateInputValue(addBillingCycle(start, subscription?.billing_cycle)),
    );
    setCancelReason("");
  }

  async function handleDialogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subscription?.id || !dialogAction) return;

    if (dialogAction === "cancel" && !cancelReason.trim()) {
      toast.error("Cancellation reason is required.");
      return;
    }

    if (
      (dialogAction === "activate" || dialogAction === "renew") &&
      (!startsAt || !endsAt)
    ) {
      toast.error("Start and end dates are required.");
      return;
    }

    if (dialogAction === "change" && !selectedPlan?.id) {
      toast.error("Select a plan.");
      return;
    }

    const toastId = toast.loading("Updating subscription...");
    try {
      if (dialogAction === "activate") {
        await activateSubscription({
          subscriptionId: subscription.id,
          modelsActivateSubscriptionRequest: {
            starts_at: toApiDateTime(startsAt),
            ends_at: toApiDateTime(endsAt),
          },
        }).unwrap();
      }
      if (dialogAction === "renew") {
        await renewSubscription({
          subscriptionId: subscription.id,
          modelsRenewSubscriptionRequest: {
            starts_at: toApiDateTime(startsAt),
            ends_at: toApiDateTime(endsAt),
          },
        }).unwrap();
      }
      if (dialogAction === "change" && selectedPlan?.id) {
        await changePlan({
          subscriptionId: subscription.id,
          planId: selectedPlan.id,
        }).unwrap();
      }
      if (dialogAction === "cancel") {
        await cancelSubscription({
          subscriptionId: subscription.id,
          modelsCancelSubscriptionRequest: { reason: cancelReason.trim() },
        }).unwrap();
      }
      toast.success("Subscription updated.", { id: toastId });
      setDialogAction(null);
      lookupQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update subscription."), {
        id: toastId,
      });
    }
  }

  async function handleExpire() {
    if (!subscription?.id) return;
    const toastId = toast.loading("Expiring subscription...");
    try {
      const response = await expireSubscription({
        subscriptionId: subscription.id,
      }).unwrap();
      toast.success(getApiMessage(response, "Subscription expired."), {
        id: toastId,
      });
      lookupQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not expire subscription."), {
        id: toastId,
      });
    }
  }

  return (
    <WorkspacePage size="narrow">
      <PageHeader
        actions={
          <RefreshButton
            loading={lookupQuery.isFetching}
            onClick={() => lookupQuery.refetch()}
          />
        }
        description="Manage billing period, plan changes, and subscription status."
        eyebrow={
          <BackLink
            href={paths.developerSubscriptions()}
            label="Subscriptions"
          />
        }
        title={subscription?.society_name ?? `Subscription #${subscriptionId}`}
      />

      <AsyncPanel
        error={lookupQuery.isError ? "Refresh and try again." : null}
        loading={lookupQuery.isLoading}
        loadingLabel="Loading subscription"
        onRetry={() => lookupQuery.refetch()}
      >
        {subscription ? (
          <DetailPageLayout
            actions={
              <>
                <ActionPanel
                  description="Move the subscription through its operational lifecycle."
                  title="Subscription lifecycle"
                >
                  {subscription.status === "pending" ? (
                    <Button
                      disabled={busy}
                      onClick={() => openDialog("activate")}
                      type="button"
                    >
                      Activate
                    </Button>
                  ) : null}
                  {subscription.status === "active" ||
                  subscription.status === "trial" ? (
                    <>
                      <Button
                        disabled={busy}
                        onClick={() => openDialog("renew")}
                        type="button"
                        variant="outline"
                      >
                        Renew
                      </Button>
                      <Button
                        disabled={busy}
                        onClick={() => openDialog("change")}
                        type="button"
                        variant="outline"
                      >
                        Change plan
                      </Button>
                    </>
                  ) : null}
                </ActionPanel>
                <DangerZone>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={busy}
                      onClick={() => openDialog("cancel")}
                      type="button"
                      variant="destructive"
                    >
                      Cancel subscription
                    </Button>
                    <Button
                      disabled={busy}
                      onClick={handleExpire}
                      type="button"
                      variant="outline"
                    >
                      Mark expired
                    </Button>
                  </div>
                </DangerZone>
              </>
            }
            summary={
              <StatusHero
                description={subscription.plan_name ?? "No plan name"}
                icon={<CreditCard className="size-5" />}
                status={subscription.status}
                title={
                  subscription.society_name ??
                  `Society #${subscription.society_id}`
                }
              />
            }
            sidebar={
              <div className="space-y-4 rounded-xl border border-border bg-card p-5 text-sm">
                <p>
                  <span className="text-muted-foreground">Society: </span>
                  {subscription.society_id ? (
                    <Link
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      href={paths.developerSociety(subscription.society_id)}
                    >
                      {subscription.society_name ?? "Open society"}
                    </Link>
                  ) : (
                    "Not linked"
                  )}
                </p>
                <p>
                  <span className="text-muted-foreground">Plan: </span>
                  {subscription.plan_name ?? "Not set"}
                </p>
                <p>
                  <span className="text-muted-foreground">Price: </span>
                  {formatMoney(
                    subscription.price_amount_paise,
                    subscription.currency,
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {formatNumberIN(subscription.max_flats)} flats
                  </Badge>
                  <Badge variant="outline">
                    {formatNumberIN(subscription.max_residents)} residents
                  </Badge>
                </div>
              </div>
            }
            main={<TimelineCard items={timelineItems} />}
          />
        ) : null}
      </AsyncPanel>

      <Dialog
        onOpenChange={(open) => !open && setDialogAction(null)}
        open={dialogAction !== null && dialogAction !== "cancel"}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "activate"
                ? "Activate subscription"
                : dialogAction === "renew"
                  ? "Renew subscription"
                  : "Change plan"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "change"
                ? "Select the new plan for this society."
                : "Set the billing period for this change."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleDialogSubmit}>
            {dialogAction === "change" ? (
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                onChange={(event) => setSelectedPlanId(event.target.value)}
                value={selectedPlanId}
              >
                <option value="">Select plan</option>
                {plans.map((plan) =>
                  plan.id ? (
                    <option key={plan.id} value={String(plan.id)}>
                      {plan.name} — {titleCaseFromSnake(plan.billing_cycle)}
                    </option>
                  ) : null,
                )}
              </select>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className="space-y-2 text-sm"
                  htmlFor="subscription-starts-at"
                >
                  <span className="font-medium">Starts at</span>
                  <Input
                    id="subscription-starts-at"
                    required
                    type="date"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                  />
                </label>
                <label
                  className="space-y-2 text-sm"
                  htmlFor="subscription-ends-at"
                >
                  <span className="font-medium">Ends at</span>
                  <Input
                    id="subscription-ends-at"
                    required
                    type="date"
                    value={endsAt}
                    onChange={(event) => setEndsAt(event.target.value)}
                  />
                </label>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setDialogAction(null)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={busy} type="submit">
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmReasonDialog
        busy={busy}
        confirmLabel="Cancel subscription"
        description="The society may lose operational access depending on policy."
        destructive
        onConfirm={() => {
          if (!subscription?.id) return;
          const toastId = toast.loading("Cancelling...");
          cancelSubscription({
            subscriptionId: subscription.id,
            modelsCancelSubscriptionRequest: {
              reason: cancelReason.trim(),
            },
          })
            .unwrap()
            .then((response) => {
              toast.success(getApiMessage(response, "Cancelled."), {
                id: toastId,
              });
              setDialogAction(null);
              lookupQuery.refetch();
            })
            .catch((error) =>
              toast.error(getApiErrorMessage(error, "Could not cancel."), {
                id: toastId,
              }),
            );
        }}
        onOpenChange={(open) => !open && setDialogAction(null)}
        onReasonChange={setCancelReason}
        open={dialogAction === "cancel"}
        reason={cancelReason}
        reasonRequired
        title="Cancel subscription?"
      />
    </WorkspacePage>
  );
}
