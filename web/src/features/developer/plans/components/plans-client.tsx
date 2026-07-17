"use client";

import {
  CheckCircle2,
  ExternalLink,
  Layers3,
  Pencil,
  Plus,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { FilterPanel } from "@/components/data/filter-panel";
import { ListToolbar } from "@/components/data/list-toolbar";
import { PaginationFooter } from "@/components/data/pagination-footer";
import { FilterSelect } from "@/components/forms/filter-select";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RefreshButton } from "@/components/shared/refresh-button";
import { SearchInput } from "@/components/shared/search-input";
import { SectionCard } from "@/components/shared/section-card";
import { WorkspacePage } from "@/components/shared/workspace-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  type ModelsBillingCycle,
  type ModelsCreatePlanRequest,
  type ModelsPlanResponse,
  type ModelsUpdatePlanRequest,
  useGetV1PlansLookupQuery,
  useGetV1PlansQuery,
  usePatchV1PlansByPlanIdMutation,
  usePostV1PlansByPlanIdActivateMutation,
  usePostV1PlansByPlanIdDeactivateMutation,
  usePostV1PlansMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { formatMoney, formatNumberIN, titleCaseFromSnake } from "@/lib/format";
import { usePagination } from "@/lib/hooks";
import { paths } from "@/lib/routes/paths";

type PlanFormState = {
  name: string;
  code: string;
  description: string;
  billingCycle: ModelsBillingCycle;
  currency: string;
  priceAmountPaise: string;
  maxFlats: string;
  maxResidents: string;
  maxAdmins: string;
  maxStaff: string;
};

type PlanStatusAction = {
  plan: ModelsPlanResponse;
  type: "activate" | "deactivate";
};

const emptyForm: PlanFormState = {
  name: "",
  code: "",
  description: "",
  billingCycle: "monthly",
  currency: "INR",
  priceAmountPaise: "",
  maxFlats: "",
  maxResidents: "",
  maxAdmins: "",
  maxStaff: "",
};

function numberInputValue(value?: number) {
  return typeof value === "number" ? String(value) : "";
}

function formFromPlan(plan?: ModelsPlanResponse): PlanFormState {
  if (!plan) return emptyForm;
  return {
    name: plan.name ?? "",
    code: plan.code ?? "",
    description: plan.description ?? "",
    billingCycle: plan.billing_cycle ?? "monthly",
    currency: plan.currency ?? "INR",
    priceAmountPaise: numberInputValue(plan.price_amount_paise),
    maxFlats: numberInputValue(plan.max_flats),
    maxResidents: numberInputValue(plan.max_residents),
    maxAdmins: numberInputValue(plan.max_admins),
    maxStaff: numberInputValue(plan.max_staff),
  };
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function requiredNumber(value: string) {
  const parsed = optionalNumber(value);
  return typeof parsed === "number" ? parsed : undefined;
}

function buildUpdateRequest(form: PlanFormState): ModelsUpdatePlanRequest {
  return {
    name: form.name.trim() || undefined,
    code: form.code.trim() || undefined,
    description: form.description.trim() || undefined,
    billing_cycle: form.billingCycle,
    currency: form.currency.trim() || undefined,
    price_amount_paise: optionalNumber(form.priceAmountPaise),
    max_flats: requiredNumber(form.maxFlats),
    max_residents: requiredNumber(form.maxResidents),
    max_admins: optionalNumber(form.maxAdmins),
    max_staff: optionalNumber(form.maxStaff),
  };
}

function buildCreateRequest(form: PlanFormState): ModelsCreatePlanRequest {
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    description: form.description.trim() || undefined,
    billing_cycle: form.billingCycle,
    currency: form.currency.trim() || "INR",
    price_amount_paise: optionalNumber(form.priceAmountPaise),
    max_flats: requiredNumber(form.maxFlats) ?? 0,
    max_residents: requiredNumber(form.maxResidents) ?? 0,
    max_admins: optionalNumber(form.maxAdmins),
    max_staff: optionalNumber(form.maxStaff),
  };
}

export function PlansClient() {
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [billingCycle, setBillingCycle] = useState<ModelsBillingCycle | "all">(
    "all",
  );
  const [active, setActive] = useState<"all" | "active" | "inactive">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [statusAction, setStatusAction] = useState<PlanStatusAction | null>(
    null,
  );
  const estimatedTotalRef = useRef(0);
  const { page, pageSize, offset, totalPages, setPage, setPageSize } =
    usePagination({
      totalItems: estimatedTotalRef.current,
      resetDeps: [search, code, billingCycle, active],
    });

  const plansQuery = useGetV1PlansQuery({
    code: code.trim() || undefined,
    billingCycle: billingCycle === "all" ? undefined : billingCycle,
    search: search.trim() || undefined,
    isActive: active === "all" ? undefined : active === "active",
    limit: pageSize,
    offset,
  });
  const selectedPlanQuery = useGetV1PlansLookupQuery(
    { id: editingPlanId ?? undefined },
    { skip: !editingPlanId },
  );
  const [createPlan, { isLoading: isCreating }] = usePostV1PlansMutation();
  const [updatePlan, { isLoading: isUpdating }] =
    usePatchV1PlansByPlanIdMutation();
  const [activatePlan, { isLoading: isActivating }] =
    usePostV1PlansByPlanIdActivateMutation();
  const [deactivatePlan, { isLoading: isDeactivating }] =
    usePostV1PlansByPlanIdDeactivateMutation();

  const plans = plansQuery.data?.data?.plans ?? [];
  const hasNextPage = plans.length >= pageSize;
  estimatedTotalRef.current = hasNextPage
    ? page * pageSize + 1
    : (page - 1) * pageSize + plans.length;
  const resolvedTotalPages = hasNextPage
    ? Math.max(totalPages, page + 1)
    : page;
  const selectedPlan = selectedPlanQuery.data?.data?.plan;
  const statusPlanName = statusAction?.plan.name ?? "this plan";
  const isStatusLoading = isActivating || isDeactivating;
  const isSavingPlan = isCreating || isUpdating;
  const planDialogOpen = isCreateDialogOpen || editingPlanId !== null;

  const selectedPlanTitle = useMemo(() => {
    if (isCreateDialogOpen) {
      return "New plan";
    }
    if (selectedPlanQuery.isLoading || selectedPlanQuery.isFetching) {
      return "Loading plan";
    }
    return selectedPlan?.name ?? "Edit plan";
  }, [
    isCreateDialogOpen,
    selectedPlan,
    selectedPlanQuery.isFetching,
    selectedPlanQuery.isLoading,
  ]);

  useEffect(() => {
    if (selectedPlan) {
      setForm(formFromPlan(selectedPlan));
    }
  }, [selectedPlan]);

  function setField<K extends keyof PlanFormState>(
    key: K,
    value: PlanFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openEdit(plan: ModelsPlanResponse) {
    if (!plan.id) {
      toast.error("Plan ID is missing.");
      return;
    }
    setIsCreateDialogOpen(false);
    setForm(formFromPlan(plan));
    setEditingPlanId(plan.id);
  }

  function openCreate() {
    setEditingPlanId(null);
    setForm(emptyForm);
    setIsCreateDialogOpen(true);
  }

  function closePlanDialog() {
    if (isSavingPlan) return;
    setIsCreateDialogOpen(false);
    setEditingPlanId(null);
    setForm(emptyForm);
  }

  async function handleSubmitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Plan name and code are required.");
      return;
    }
    if (!form.maxFlats.trim() || !form.maxResidents.trim()) {
      toast.error("Max flats and max residents are required.");
      return;
    }

    const isCreate = isCreateDialogOpen;
    const toastId = toast.loading(
      isCreate ? "Creating plan..." : "Updating plan...",
    );
    try {
      const response =
        isCreate || !editingPlanId
          ? await createPlan({
              modelsCreatePlanRequest: buildCreateRequest(form),
            }).unwrap()
          : await updatePlan({
              planId: editingPlanId,
              modelsUpdatePlanRequest: buildUpdateRequest(form),
            }).unwrap();
      toast.success(
        getApiMessage(
          response,
          isCreate
            ? "Plan created successfully."
            : "Plan updated successfully.",
        ),
        {
          id: toastId,
        },
      );
      closePlanDialog();
      plansQuery.refetch();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isCreate ? "Could not create plan." : "Could not update plan.",
        ),
        {
          id: toastId,
        },
      );
    }
  }

  async function handleStatusAction() {
    if (!statusAction?.plan.id) return;

    const label =
      statusAction.type === "activate"
        ? "Activating plan"
        : "Deactivating plan";
    const fallback =
      statusAction.type === "activate"
        ? "Plan activated successfully."
        : "Plan deactivated successfully.";
    const errorFallback =
      statusAction.type === "activate"
        ? "Could not activate plan."
        : "Could not deactivate plan.";
    const mutation =
      statusAction.type === "activate" ? activatePlan : deactivatePlan;

    const toastId = toast.loading(`${label}...`);
    try {
      const response = await mutation({
        planId: statusAction.plan.id,
      }).unwrap();
      toast.success(getApiMessage(response, fallback), { id: toastId });
      setStatusAction(null);
      plansQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, errorFallback), { id: toastId });
    }
  }

  return (
    <WorkspacePage>
      <PageHeader
        actions={
          <>
            <Button type="button" onClick={openCreate}>
              <Plus className="size-4" />
              New plan
            </Button>
            <RefreshButton
              loading={plansQuery.isFetching}
              onClick={() => plansQuery.refetch()}
            />
          </>
        }
        description="Inspect billing cycles, prices, and subscription limits."
        eyebrow="Developer workspace"
        title="Plans"
      />

      <SectionCard
        contentClassName="space-y-4"
        description={`${formatNumberIN(plans.length)} plans returned by the platform API`}
        title="Plan Catalog"
      >
        <div className="space-y-3">
          <ListToolbar className="border-0 bg-transparent p-0 sm:grid sm:grid-cols-[minmax(220px,1fr)_140px]">
            <SearchInput
              placeholder="Search plans"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <FilterSelect
              aria-label="Filter by active state"
              value={active}
              onChange={(event) =>
                setActive(event.target.value as "all" | "active" | "inactive")
              }
              options={[
                { label: "All states", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </ListToolbar>
          <FilterPanel>
            <Input
              onChange={(event) => setCode(event.target.value)}
              placeholder="Plan code"
              value={code}
            />
            <FilterSelect
              aria-label="Filter by billing cycle"
              value={billingCycle}
              onChange={(event) =>
                setBillingCycle(
                  event.target.value as ModelsBillingCycle | "all",
                )
              }
              options={[
                { label: "All cycles", value: "all" },
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" },
              ]}
            />
          </FilterPanel>
        </div>

        {plans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <Card size="sm" key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Layers3 className="size-4 shrink-0" />
                        <span className="truncate">
                          {plan.name ?? "Unnamed plan"}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {plan.code ?? "No code"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {plan.id ? (
                        <Button asChild size="sm" type="button" variant="ghost">
                          <Link href={paths.developerPlan(plan.id)}>
                            <ExternalLink className="size-4" />
                            Details
                          </Link>
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(plan)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={plan.is_active ? "default" : "outline"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="secondary">
                      {titleCaseFromSnake(plan.billing_cycle)}
                    </Badge>
                    <span className="font-semibold text-sm">
                      {formatMoney(plan.price_amount_paise, plan.currency)}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <p className="font-semibold">
                        {formatNumberIN(plan.max_flats)}
                      </p>
                      <p className="text-muted-foreground text-xs">Flats</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="font-semibold">
                        {formatNumberIN(plan.max_residents)}
                      </p>
                      <p className="text-muted-foreground text-xs">Residents</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="font-semibold">
                        {formatNumberIN(plan.max_admins)}
                      </p>
                      <p className="text-muted-foreground text-xs">Admins</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="font-semibold">
                        {formatNumberIN(plan.max_staff)}
                      </p>
                      <p className="text-muted-foreground text-xs">Staff</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant={plan.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        setStatusAction({
                          plan,
                          type: plan.is_active ? "deactivate" : "activate",
                        })
                      }
                    >
                      {plan.is_active ? (
                        <XCircle className="size-4" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      {plan.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No plans found"
            description="Change the filters or refresh the catalog."
          />
        )}
        <PaginationFooter
          loading={plansQuery.isFetching}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          page={page}
          pageSize={pageSize}
          totalItems={estimatedTotalRef.current}
          totalPages={resolvedTotalPages}
        />
      </SectionCard>

      <Dialog
        open={planDialogOpen}
        onOpenChange={(open) => !open && closePlanDialog()}
      >
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlanTitle}</DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen
                ? "Create a subscription plan with limits, billing cycle, and pricing."
                : "Update plan details, limits, billing cycle, and pricing."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitPlan}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm" htmlFor="plan-name">
                <span className="font-medium">Name</span>
                <Input
                  id="plan-name"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                  required
                />
              </label>
              <label className="space-y-1.5 text-sm" htmlFor="plan-code">
                <span className="font-medium">Code</span>
                <Input
                  id="plan-code"
                  value={form.code}
                  onChange={(event) => setField("code", event.target.value)}
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                  required
                />
              </label>
              <label
                className="space-y-1.5 text-sm"
                htmlFor="plan-billing-cycle"
              >
                <span className="font-medium">Billing cycle</span>
                <select
                  id="plan-billing-cycle"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
                  value={form.billingCycle}
                  onChange={(event) =>
                    setField(
                      "billingCycle",
                      event.target.value as ModelsBillingCycle,
                    )
                  }
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm" htmlFor="plan-currency">
                <span className="font-medium">Currency</span>
                <Input
                  id="plan-currency"
                  value={form.currency}
                  onChange={(event) => setField("currency", event.target.value)}
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                />
              </label>
              <label className="space-y-1.5 text-sm" htmlFor="plan-price">
                <span className="font-medium">Price amount in paise</span>
                <Input
                  id="plan-price"
                  type="number"
                  min={0}
                  value={form.priceAmountPaise}
                  onChange={(event) =>
                    setField("priceAmountPaise", event.target.value)
                  }
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                />
              </label>
              <label className="space-y-1.5 text-sm" htmlFor="plan-max-flats">
                <span className="font-medium">Max flats</span>
                <Input
                  id="plan-max-flats"
                  type="number"
                  min={0}
                  value={form.maxFlats}
                  onChange={(event) => setField("maxFlats", event.target.value)}
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                  required
                />
              </label>
              <label
                className="space-y-1.5 text-sm"
                htmlFor="plan-max-residents"
              >
                <span className="font-medium">Max residents</span>
                <Input
                  id="plan-max-residents"
                  type="number"
                  min={0}
                  value={form.maxResidents}
                  onChange={(event) =>
                    setField("maxResidents", event.target.value)
                  }
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                  required
                />
              </label>
              <label className="space-y-1.5 text-sm" htmlFor="plan-max-admins">
                <span className="font-medium">Max admins</span>
                <Input
                  id="plan-max-admins"
                  type="number"
                  min={0}
                  value={form.maxAdmins}
                  onChange={(event) =>
                    setField("maxAdmins", event.target.value)
                  }
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                />
              </label>
              <label className="space-y-1.5 text-sm" htmlFor="plan-max-staff">
                <span className="font-medium">Max staff</span>
                <Input
                  id="plan-max-staff"
                  type="number"
                  min={0}
                  value={form.maxStaff}
                  onChange={(event) => setField("maxStaff", event.target.value)}
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                />
              </label>
              <label
                className="space-y-1.5 text-sm sm:col-span-2"
                htmlFor="plan-description"
              >
                <span className="font-medium">Description</span>
                <textarea
                  id="plan-description"
                  className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  disabled={selectedPlanQuery.isFetching || isSavingPlan}
                />
              </label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closePlanDialog}
                disabled={isSavingPlan}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={selectedPlanQuery.isFetching || isSavingPlan}
              >
                {isSavingPlan
                  ? "Saving..."
                  : isCreateDialogOpen
                    ? "Create plan"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={statusAction !== null}
        onOpenChange={(open) =>
          !open && !isStatusLoading && setStatusAction(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusAction?.type === "activate"
                ? "Activate plan?"
                : "Deactivate plan?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction?.type === "activate"
                ? `This will make ${statusPlanName} available for subscriptions.`
                : `This will stop ${statusPlanName} from being available for new subscriptions.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isStatusLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isStatusLoading}
              onClick={(event) => {
                event.preventDefault();
                handleStatusAction();
              }}
            >
              {isStatusLoading
                ? "Working..."
                : statusAction?.type === "activate"
                  ? "Activate"
                  : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </WorkspacePage>
  );
}
