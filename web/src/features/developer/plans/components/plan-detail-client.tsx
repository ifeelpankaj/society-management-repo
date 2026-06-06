"use client";

import { Layers3, Pencil, Save } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { AsyncPanel } from "@/components/shared/async-panel";
import { BackLink } from "@/components/shared/back-link";
import { KeyValueGrid } from "@/components/shared/key-value-grid";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildUpdatePlanRequest,
  type PlanFormState,
  planFormFromPlan,
} from "@/features/developer/plans/lib/plan-form";
import {
  ActionPanel,
  ConfirmReasonDialog,
  DetailPageLayout,
  StatusHero,
} from "@/features/shared/detail-page";
import {
  useGetV1PlansLookupQuery,
  usePatchV1PlansByPlanIdMutation,
  usePostV1PlansByPlanIdActivateMutation,
  usePostV1PlansByPlanIdDeactivateMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import {
  formatMoney,
  formatShortDateIN,
  titleCaseFromSnake,
} from "@/lib/format";
import { paths } from "@/lib/routes/paths";

type PlanDetailClientProps = {
  planId: number;
};

export function PlanDetailClient({ planId }: PlanDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<PlanFormState>(planFormFromPlan());
  const [statusDialog, setStatusDialog] = useState<
    "activate" | "deactivate" | null
  >(null);

  const planQuery = useGetV1PlansLookupQuery({ id: planId });
  const plan = planQuery.data?.data?.plan;
  const [updatePlan, { isLoading: isUpdating }] =
    usePatchV1PlansByPlanIdMutation();
  const [activatePlan, { isLoading: isActivating }] =
    usePostV1PlansByPlanIdActivateMutation();
  const [deactivatePlan, { isLoading: isDeactivating }] =
    usePostV1PlansByPlanIdDeactivateMutation();
  const busy = isUpdating || isActivating || isDeactivating;

  useEffect(() => {
    if (plan) setForm(planFormFromPlan(plan));
  }, [plan]);

  function setField<K extends keyof PlanFormState>(
    key: K,
    value: PlanFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Plan name and code are required.");
      return;
    }
    const toastId = toast.loading("Saving plan...");
    try {
      const response = await updatePlan({
        planId,
        modelsUpdatePlanRequest: buildUpdatePlanRequest(form),
      }).unwrap();
      toast.success(getApiMessage(response, "Plan updated."), { id: toastId });
      setIsEditing(false);
      planQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update plan."), {
        id: toastId,
      });
    }
  }

  async function handleStatusChange() {
    if (!statusDialog) return;
    const toastId = toast.loading(
      statusDialog === "activate"
        ? "Activating plan..."
        : "Deactivating plan...",
    );
    try {
      const response =
        statusDialog === "activate"
          ? await activatePlan({ planId }).unwrap()
          : await deactivatePlan({ planId }).unwrap();
      toast.success(
        getApiMessage(
          response,
          statusDialog === "activate" ? "Plan activated." : "Plan deactivated.",
        ),
        { id: toastId },
      );
      setStatusDialog(null);
      planQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update plan status."), {
        id: toastId,
      });
    }
  }

  return (
    <WorkspacePage size="narrow">
      <PageHeader
        actions={
          <RefreshButton
            loading={planQuery.isFetching}
            onClick={() => planQuery.refetch()}
          />
        }
        description="Edit pricing, limits, and availability for this subscription plan."
        eyebrow={<BackLink href={paths.developerPlans()} label="Plans" />}
        title={plan?.name ?? "Plan details"}
      />

      <AsyncPanel
        error={planQuery.isError ? "Refresh and try again." : null}
        loading={planQuery.isLoading}
        loadingLabel="Loading plan"
        onRetry={() => planQuery.refetch()}
      >
        {plan ? (
          <DetailPageLayout
            actions={
              <ActionPanel
                description={
                  plan.is_active
                    ? "Deactivating hides this plan from new subscriptions."
                    : "Activate to allow new societies to select this plan."
                }
                title="Plan lifecycle"
              >
                {plan.is_active ? (
                  <Button
                    disabled={busy}
                    onClick={() => setStatusDialog("deactivate")}
                    type="button"
                    variant="outline"
                  >
                    Deactivate plan
                  </Button>
                ) : (
                  <Button
                    disabled={busy}
                    onClick={() => setStatusDialog("activate")}
                    type="button"
                  >
                    Activate plan
                  </Button>
                )}
              </ActionPanel>
            }
            summary={
              <StatusHero
                description={plan.code ?? "No plan code"}
                icon={<Layers3 className="size-5" />}
                status={plan.is_active ? "active" : "inactive"}
                statusVariant={plan.is_active ? "default" : "outline"}
                title={plan.name ?? "Unnamed plan"}
              />
            }
            sidebar={
              <KeyValueGrid
                items={[
                  {
                    id: "price",
                    label: "Price",
                    value: formatMoney(plan.price_amount_paise, plan.currency),
                  },
                  {
                    id: "billing",
                    label: "Billing",
                    value: titleCaseFromSnake(plan.billing_cycle),
                  },
                  {
                    id: "created",
                    label: "Created",
                    value: formatShortDateIN(plan.created_at),
                  },
                  {
                    id: "updated",
                    label: "Updated",
                    value: formatShortDateIN(plan.updated_at),
                  },
                ]}
              />
            }
            main={
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-sm">Plan editor</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsEditing((value) => !value);
                        setForm(planFormFromPlan(plan));
                      }}
                      type="button"
                      variant="outline"
                    >
                      <Pencil className="size-4" />
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                    {isEditing ? (
                      <Button disabled={busy} type="submit">
                        <Save className="size-4" />
                        Save changes
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    disabled={!isEditing}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Plan name"
                    value={form.name}
                  />
                  <Input
                    disabled={!isEditing}
                    onChange={(e) => setField("code", e.target.value)}
                    placeholder="Plan code"
                    value={form.code}
                  />
                  <Input
                    className="md:col-span-2"
                    disabled={!isEditing}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Description"
                    value={form.description}
                  />
                  <Input
                    disabled={!isEditing}
                    onChange={(e) =>
                      setField("priceAmountPaise", e.target.value)
                    }
                    placeholder="Price (paise)"
                    value={form.priceAmountPaise}
                  />
                  <select
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                    disabled={!isEditing}
                    onChange={(e) =>
                      setField(
                        "billingCycle",
                        e.target.value as PlanFormState["billingCycle"],
                      )
                    }
                    value={form.billingCycle}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <Input
                    disabled={!isEditing}
                    onChange={(e) => setField("maxFlats", e.target.value)}
                    placeholder="Max flats"
                    value={form.maxFlats}
                  />
                  <Input
                    disabled={!isEditing}
                    onChange={(e) => setField("maxResidents", e.target.value)}
                    placeholder="Max residents"
                    value={form.maxResidents}
                  />
                  <Input
                    disabled={!isEditing}
                    onChange={(e) => setField("maxAdmins", e.target.value)}
                    placeholder="Max admins"
                    value={form.maxAdmins}
                  />
                  <Input
                    disabled={!isEditing}
                    onChange={(e) => setField("maxStaff", e.target.value)}
                    placeholder="Max staff"
                    value={form.maxStaff}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {formatMoney(plan.price_amount_paise, plan.currency)} /{" "}
                    {titleCaseFromSnake(plan.billing_cycle)}
                  </Badge>
                  <Badge variant="outline">
                    {plan.max_flats ?? 0} flats cap
                  </Badge>
                  <Badge variant="outline">
                    {plan.max_residents ?? 0} residents cap
                  </Badge>
                </div>
              </form>
            }
          />
        ) : null}
      </AsyncPanel>

      <ConfirmReasonDialog
        busy={busy}
        confirmLabel={statusDialog === "activate" ? "Activate" : "Deactivate"}
        description={
          statusDialog === "activate"
            ? "New societies will be able to select this plan."
            : "Existing subscriptions are not removed, but new assignments should stop."
        }
        onConfirm={handleStatusChange}
        onOpenChange={(open) => !open && setStatusDialog(null)}
        onReasonChange={() => {}}
        open={statusDialog !== null}
        reason=""
        title={
          statusDialog === "activate"
            ? "Activate this plan?"
            : "Deactivate this plan?"
        }
      />
    </WorkspacePage>
  );
}
