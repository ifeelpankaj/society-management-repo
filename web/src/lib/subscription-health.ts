import type {
  ModelsSocietyDashboardSubscriptionHealthResponse,
  ModelsSocietySubscriptionResponse,
} from "@/lib/api/generated-api";

const EXPIRING_SOON_DAYS = 14;

export type ResolvedSubscriptionHealth =
  ModelsSocietyDashboardSubscriptionHealthResponse;

function daysBetween(from: Date, to: Date) {
  const diffMs = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function deriveLifecycleLabel(
  subscription: ModelsSocietySubscriptionResponse,
  isActive: boolean,
  isDateExpired: boolean,
  isTrialExpired: boolean,
  isExpiringSoon: boolean,
): string {
  const status = subscription.status;

  if (status === "cancelled") return "cancelled";
  if (status === "pending") return "pending";
  if (status === "expired" || isDateExpired || isTrialExpired) return "expired";
  if (isExpiringSoon) return "expiring_soon";
  if (status === "trial") return "trial";
  if (isActive) return "active";
  return "none";
}

function computeHealthFromSubscription(
  subscription: ModelsSocietySubscriptionResponse,
): ResolvedSubscriptionHealth {
  const now = new Date();
  const endsAt = subscription.ends_at ? new Date(subscription.ends_at) : null;
  const trialEndsAt = subscription.trial_ends_at
    ? new Date(subscription.trial_ends_at)
    : null;

  const isDateExpired = endsAt ? endsAt <= now : false;
  const isTrialExpired =
    subscription.status === "trial" && trialEndsAt ? trialEndsAt <= now : false;

  const isActive =
    (subscription.status === "active" || subscription.status === "trial") &&
    !isDateExpired &&
    !isTrialExpired;

  let daysUntilExpiry: number | undefined;
  let isExpiringSoon = false;

  if (endsAt && !isDateExpired) {
    daysUntilExpiry = daysBetween(now, endsAt);
    if (isActive && daysUntilExpiry <= EXPIRING_SOON_DAYS) {
      isExpiringSoon = true;
    }
  }

  const lifecycleLabel = deriveLifecycleLabel(
    subscription,
    isActive,
    isDateExpired,
    isTrialExpired,
    isExpiringSoon,
  );

  return {
    days_until_expiry: daysUntilExpiry,
    is_active: isActive,
    is_expiring_soon: isExpiringSoon,
    lifecycle_label: lifecycleLabel,
  };
}

export function resolveSubscriptionHealth(
  subscription: ModelsSocietySubscriptionResponse | null | undefined,
  apiHealth: ModelsSocietyDashboardSubscriptionHealthResponse | null | undefined,
): ResolvedSubscriptionHealth | null {
  if (apiHealth?.lifecycle_label) {
    return {
      days_until_expiry: apiHealth.days_until_expiry,
      is_active: apiHealth.is_active,
      is_expiring_soon: apiHealth.is_expiring_soon,
      lifecycle_label: apiHealth.lifecycle_label,
    };
  }

  if (!subscription) {
    return apiHealth ?? { is_active: false, is_expiring_soon: false, lifecycle_label: "none" };
  }

  return computeHealthFromSubscription(subscription);
}

export function computePlanPeriodProgress(
  startsAt?: string | null,
  endsAt?: string | null,
): { elapsedPercent: number; remainingPercent: number; totalDays: number; elapsedDays: number; remainingDays: number } | null {
  if (!startsAt || !endsAt) return null;

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const now = new Date();

  if (end <= start) return null;

  const totalDays = daysBetween(start, end);
  const elapsedDays = Math.min(totalDays, daysBetween(start, now));
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const elapsedPercent = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;
  const remainingPercent = 100 - elapsedPercent;

  return { elapsedPercent, remainingPercent, totalDays, elapsedDays, remainingDays };
}
