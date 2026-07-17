"use client";

import type { ModelsPlanResponse } from "@/lib/api/generated-api";
import { cn } from "@/lib/utils";

type PlanSelectProps = {
  plans: ModelsPlanResponse[];
  value: number | null;
  onChange: (planId: number | null) => void;
  disabled?: boolean;
  className?: string;
};

export function PlanSelect({
  plans,
  value,
  onChange,
  disabled,
  className,
}: PlanSelectProps) {
  return (
    <select
      aria-label="Select subscription plan"
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      onChange={(event) => {
        const next = Number(event.target.value);
        onChange(Number.isFinite(next) && next > 0 ? next : null);
      }}
      value={value ?? ""}
    >
      <option value="">Select plan</option>
      {plans.map((plan) => (
        <option key={plan.id ?? plan.code ?? plan.name} value={plan.id ?? ""}>
          {plan.name ?? "Plan"} {plan.code ? `(${plan.code})` : ""}
        </option>
      ))}
    </select>
  );
}
