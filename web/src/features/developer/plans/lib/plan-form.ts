import type {
  ModelsBillingCycle,
  ModelsCreatePlanRequest,
  ModelsPlanResponse,
  ModelsUpdatePlanRequest,
} from "@/lib/api/generated-api";

export type PlanFormState = {
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

export const emptyPlanForm: PlanFormState = {
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

export function planFormFromPlan(plan?: ModelsPlanResponse): PlanFormState {
  if (!plan) return emptyPlanForm;
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

export function buildUpdatePlanRequest(
  form: PlanFormState,
): ModelsUpdatePlanRequest {
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

export function buildCreatePlanRequest(
  form: PlanFormState,
): ModelsCreatePlanRequest {
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
