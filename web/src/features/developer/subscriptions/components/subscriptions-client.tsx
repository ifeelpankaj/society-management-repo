"use client";

import { CheckCircle2, CreditCard } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ListToolbar } from "@/components/data/list-toolbar";
import { FilterSelect } from "@/components/forms/filter-select";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import { SectionCard } from "@/components/shared/section-card";
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
  type ModelsPlanResponse,
  type ModelsSocietyResponse,
  type ModelsSocietySubscriptionResponse,
  type ModelsSubscriptionStatus,
  useGetV1PlansQuery,
  useGetV1SocietiesQuery,
  useGetV1SubscriptionsQuery,
  usePostV1SocietiesBySocietyIdSubscriptionsPlansAndPlanIdPendingMutation,
  usePostV1SubscriptionsBySubscriptionIdActivateMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import {
  formatMoney,
  formatNumberIN,
  formatShortDateIN,
  titleCaseFromSnake,
} from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import { paths } from "@/lib/routes/paths";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
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

function toApiDateTime(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function societyLocation(society: ModelsSocietyResponse) {
  const parts = [society.city, society.state].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location not set";
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

function daysUntil(endDate?: string) {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function subscriptionLifecycleLabel(subscription: ModelsSocietySubscriptionResponse) {
  const remaining = daysUntil(subscription.ends_at);
  if (
    subscription.status === "active" ||
    subscription.status === "trial"
  ) {
    if (remaining != null && remaining <= 14) {
      return `Expiring in ${formatNumberIN(remaining)} days`;
    }
    if (remaining != null) {
      return `${formatNumberIN(remaining)} days left`;
    }
  }
  return titleCaseFromSnake(subscription.status);
}

export function SubscriptionsClient() {
  const searchParams = useSearchParams();
  const initialExpiring =
    searchParams.get("expiring") === "14" ? "expiring_14" : "all";
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 2000);
  const [searchMode, setSearchMode] = useState("all");
  const [status, setStatus] = useState<ModelsSubscriptionStatus | "all">("all");
  const [expiringFilter, setExpiringFilter] = useState<"all" | "expiring_14">(
    initialExpiring,
  );
  const [activating, setActivating] =
    useState<ModelsSocietySubscriptionResponse | null>(null);
  const [assigningSociety, setAssigningSociety] =
    useState<ModelsSocietyResponse | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const societiesQuery = useGetV1SocietiesQuery({
    status: "active",
    limit: 100,
    offset: 0,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const subscriptionsQuery = useGetV1SubscriptionsQuery({
    search: debouncedSearch.trim() || undefined,
    searchMode,
    status: status === "all" ? undefined : status,
    isActiveOnly: expiringFilter === "expiring_14" ? true : undefined,
    expiringDays: expiringFilter === "expiring_14" ? 14 : undefined,
  });
  const allSubscriptionsQuery = useGetV1SubscriptionsQuery({});
  const plansQuery = useGetV1PlansQuery({
    isActive: true,
    limit: 50,
    offset: 0,
  });
  const [createPendingSubscription, { isLoading: isCreatingPending }] =
    usePostV1SocietiesBySocietyIdSubscriptionsPlansAndPlanIdPendingMutation();
  const [activateSubscription, { isLoading: isActivating }] =
    usePostV1SubscriptionsBySubscriptionIdActivateMutation();
  const subscriptions = subscriptionsQuery.data?.data?.subscriptions ?? [];
  const allSubscriptions =
    allSubscriptionsQuery.data?.data?.subscriptions ?? subscriptions;
  const plans = plansQuery.data?.data?.plans ?? [];
  const subscribedSocietyIds = useMemo(
    () =>
      new Set(
        allSubscriptions
          .map((subscription) => subscription.society_id)
          .filter((societyId): societyId is number => Boolean(societyId)),
      ),
    [allSubscriptions],
  );
  const societiesNeedingSubscription = useMemo(
    () =>
      (societiesQuery.data?.data?.societies?.items ?? []).filter(
        (society) => society.id && !subscribedSocietyIds.has(society.id),
      ),
    [societiesQuery.data?.data?.societies?.items, subscribedSocietyIds],
  );
  const selectedPlan = plans.find((plan) => String(plan.id) === selectedPlanId);
  const dialogLoading = isActivating || isCreatingPending;

  useEffect(() => {
    if (!assigningSociety || !selectedPlan) return;
    if (!startsAt) return;

    setEndsAt(
      toDateInputValue(
        addBillingCycle(new Date(startsAt), selectedPlan.billing_cycle),
      ),
    );
  }, [assigningSociety, selectedPlan, startsAt]);

  const openActivation = (subscription: ModelsSocietySubscriptionResponse) => {
    const startDate = new Date();
    const endDate = addBillingCycle(startDate, subscription.billing_cycle);

    setActivating(subscription);
    setAssigningSociety(null);
    setSelectedPlanId("");
    setStartsAt(toDateInputValue(startDate));
    setEndsAt(toDateInputValue(endDate));
  };

  const openAssignment = (society: ModelsSocietyResponse) => {
    const startDate = new Date();

    setAssigningSociety(society);
    setActivating(null);
    setSelectedPlanId("");
    setStartsAt(toDateInputValue(startDate));
    setEndsAt(toDateInputValue(addBillingCycle(startDate)));
  };

  const closeActivation = () => {
    if (dialogLoading) return;
    setActivating(null);
    setAssigningSociety(null);
    setSelectedPlanId("");
    setStartsAt("");
    setEndsAt("");
  };

  const handleActivate = async (event: FormSubmitEvent) => {
    event.preventDefault();
    if (!activating?.id && !assigningSociety?.id) return;

    if (!startsAt || !endsAt) {
      toast.error("Start and end dates are required.");
      return;
    }

    if (assigningSociety && !selectedPlan?.id) {
      toast.error("Select a subscription plan.");
      return;
    }

    const toastId = toast.loading(
      assigningSociety
        ? "Assigning and activating subscription..."
        : "Activating subscription...",
    );

    try {
      let subscriptionId = activating?.id;

      if (assigningSociety?.id && selectedPlan?.id) {
        const pendingResponse = await createPendingSubscription({
          societyId: assigningSociety.id,
          planId: selectedPlan.id,
        }).unwrap();
        subscriptionId = pendingResponse.data?.subscription?.id;
      }

      if (!subscriptionId) {
        throw new Error("Subscription ID was not returned by the API.");
      }

      const response = await activateSubscription({
        subscriptionId,
        modelsActivateSubscriptionRequest: {
          starts_at: toApiDateTime(startsAt),
          ends_at: toApiDateTime(endsAt),
        },
      }).unwrap();

      toast.success(getApiMessage(response, "Subscription activated."), {
        id: toastId,
      });
      setActivating(null);
      setAssigningSociety(null);
      setSelectedPlanId("");
      setStartsAt("");
      setEndsAt("");
      subscriptionsQuery.refetch();
      allSubscriptionsQuery.refetch();
      societiesQuery.refetch();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not activate subscription."),
        {
          id: toastId,
        },
      );
    }
  };

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <RefreshButton
            loading={subscriptionsQuery.isFetching}
            onClick={() => subscriptionsQuery.refetch()}
          />
        }
        description="Review active, pending, trial, expired, and cancelled society subscriptions."
        eyebrow="Developer workspace"
        title="Subscriptions"
      />

      <SectionCard
        description={`${formatNumberIN(societiesNeedingSubscription.length)} approved societies without any subscription`}
        title="Needs Subscription"
      >
        {societiesNeedingSubscription.length > 0 ? (
          <div className="divide-y divide-border rounded-lg border border-border">
            {societiesNeedingSubscription.map((society) => (
              <div
                className="grid gap-3 p-4 lg:grid-cols-[1fr_auto]"
                key={society.id}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CreditCard className="size-4 text-muted-foreground" />
                    <p className="truncate font-medium">
                      {society.name ?? "Unnamed society"}
                    </p>
                    <Badge variant="secondary">Needs subscription</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {society.society_code ?? "No society code"} -{" "}
                    {societyLocation(society)} -{" "}
                    {formatNumberIN(society.total_flats)} flats
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    disabled={!society.id}
                    onClick={() => openAssignment(society)}
                    type="button"
                  >
                    <CheckCircle2 className="size-4" />
                    Manage subscription
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No societies need subscription"
            description="Approved societies without subscriptions will appear here."
          />
        )}
      </SectionCard>

      <SectionCard
        contentClassName="space-y-4"
        description={`${formatNumberIN(subscriptions.length)} subscriptions returned`}
        title="Subscription Ledger"
      >
        <div className="space-y-3">
          <ListToolbar className="border-0 bg-transparent p-0 sm:grid sm:grid-cols-[minmax(220px,1fr)_170px_150px_170px]">
            <SearchInput
              placeholder="Search subscriptions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <FilterSelect
              aria-label="Search subscriptions by"
              value={searchMode}
              onChange={(event) => setSearchMode(event.target.value)}
              options={[
                { label: "All fields", value: "all" },
                { label: "Society", value: "society" },
                { label: "Plan", value: "plan" },
                { label: "Action user", value: "action_user" },
                { label: "Resident / member", value: "resident_member" },
              ]}
            />
            <FilterSelect
              aria-label="Filter by status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as ModelsSubscriptionStatus | "all",
                )
              }
              options={[
                { label: "All status", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Trial", value: "trial" },
                { label: "Active", value: "active" },
                { label: "Expired", value: "expired" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
            <FilterSelect
              aria-label="Filter by renewal window"
              value={expiringFilter}
              onChange={(event) =>
                setExpiringFilter(
                  event.target.value as "all" | "expiring_14",
                )
              }
              options={[
                { label: "All renewals", value: "all" },
                { label: "Expiring in 14 days", value: "expiring_14" },
              ]}
            />
          </ListToolbar>
        </div>

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
                      {subscription.society_name ??
                        `Society #${subscription.society_id}`}
                    </p>
                    <Badge variant="secondary">
                      {titleCaseFromSnake(subscription.status)}
                    </Badge>
                    <Badge variant="outline">
                      {subscriptionLifecycleLabel(subscription)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {subscription.plan_name} -{" "}
                    {subscription.society_code ?? "No society code"} - ends{" "}
                    {formatShortDateIN(subscription.ends_at, "Not set")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <span>{formatNumberIN(subscription.max_flats)} flats</span>
                  <span>
                    {formatNumberIN(subscription.max_residents)} residents
                  </span>
                  <span>{formatNumberIN(subscription.max_admins)} admins</span>
                  <span>{formatNumberIN(subscription.max_staff)} staff</span>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {subscription.id ? (
                    <Button asChild size="sm" type="button" variant="outline">
                      <Link href={paths.developerSubscription(subscription.id)}>
                        Open details
                      </Link>
                    </Button>
                  ) : null}
                  {subscription.status === "pending" ? (
                    <Button
                      disabled={!subscription.id}
                      onClick={() => openActivation(subscription)}
                      type="button"
                    >
                      <CheckCircle2 className="size-4" />
                      Activate
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No subscriptions found"
            description="Change the filters or refresh the ledger."
          />
        )}
      </SectionCard>

      <Dialog
        open={!!activating || !!assigningSociety}
        onOpenChange={closeActivation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {assigningSociety
                ? "Manage subscription"
                : "Activate subscription"}
            </DialogTitle>
            <DialogDescription>
              {assigningSociety
                ? "Select a plan and billing period before activating this society."
                : "Set the billing period before activating this society plan."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleActivate}>
            {assigningSociety ? (
              <label className="space-y-2 text-sm" htmlFor="plan-id">
                <span className="font-medium">Plan</span>
                <select
                  id="plan-id"
                  required
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
                  disabled={plansQuery.isLoading || plansQuery.isFetching}
                  value={selectedPlanId}
                  onChange={(event) => setSelectedPlanId(event.target.value)}
                >
                  <option value="">
                    {plansQuery.isLoading ? "Loading plans..." : "Select plan"}
                  </option>
                  {plans.map((plan) =>
                    plan.id ? (
                      <option key={plan.id} value={String(plan.id)}>
                        {planLabel(plan)}
                      </option>
                    ) : null,
                  )}
                </select>
              </label>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm" htmlFor="starts-at">
                <span className="font-medium">Starts at</span>
                <Input
                  id="starts-at"
                  required
                  type="date"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm" htmlFor="ends-at">
                <span className="font-medium">Ends at</span>
                <Input
                  id="ends-at"
                  required
                  type="date"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                />
              </label>
            </div>
            <DialogFooter>
              <Button
                disabled={dialogLoading}
                onClick={closeActivation}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={dialogLoading} type="submit">
                {dialogLoading ? "Activating..." : "Activate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
