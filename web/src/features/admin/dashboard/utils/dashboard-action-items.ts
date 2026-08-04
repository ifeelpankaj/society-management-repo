import type { SocietyDashboardBootstrap } from "@/lib/api/society-dashboard-api";
import { encodeSocietyId } from "@/lib/routes/society-route";

export type DashboardActionSeverity = "danger" | "warning" | "info";

export type DashboardActionItem = {
  id: string;
  message: string;
  severity: DashboardActionSeverity;
  href?: string;
};

type QuotaKey = "flats" | "admins" | "staff" | "residents";

const quotaLabels: Record<QuotaKey, string> = {
  flats: "Flat",
  admins: "Admin",
  staff: "Staff",
  residents: "Resident",
};

export function buildDashboardActionItems(
  dashboard: SocietyDashboardBootstrap,
  societyId: number,
): DashboardActionItem[] {
  const items: DashboardActionItem[] = [];
  const encoded = encodeSocietyId(societyId);
  const base = `/dashboard/${encoded}`;
  const health = dashboard.subscription_health;
  const usage = dashboard.subscription_usage;
  const claimStats = dashboard.claim_stats;
  const visitorStats = dashboard.visitor_stats;

  if (
    health?.lifecycle_label === "none" ||
    health?.lifecycle_label === "expired" ||
    !dashboard.current_subscription
  ) {
    items.push({
      id: "subscription-inactive",
      message: "No active subscription — contact support to renew",
      severity: "danger",
    });
  } else if (health?.is_expiring_soon || health?.lifecycle_label === "expiring_soon") {
    const days = health.days_until_expiry ?? 0;
    items.push({
      id: "subscription-expiring",
      message: `Subscription expires in ${days} day${days === 1 ? "" : "s"}`,
      severity: "warning",
    });
  }

  (["flats", "admins", "staff", "residents"] as QuotaKey[]).forEach((key) => {
    const quota = usage?.[key];
    if (!quota?.limit) return;
    const label = quotaLabels[key];
    const used = quota.used ?? 0;
    const limit = quota.limit ?? 0;
    if ((quota.percent ?? 0) >= 100) {
      items.push({
        id: `${key}-limit-reached`,
        message: `${label} capacity reached (${used}/${limit})`,
        severity: "warning",
        href: key === "flats" ? `${base}/flats` : undefined,
      });
    } else if ((quota.percent ?? 0) >= 80) {
      items.push({
        id: `${key}-limit-near`,
        message: `${label} limit nearing capacity (${used}/${limit})`,
        severity: "info",
      });
    }
  });

  const pendingClaims = claimStats?.pending_claims ?? 0;
  if (pendingClaims > 0) {
    items.push({
      id: "pending-claims",
      message: `${pendingClaims} pending claim${pendingClaims === 1 ? "" : "s"}`,
      severity: "warning",
      href: `${base}/claims`,
    });
  }

  const pendingVisitors = visitorStats?.pending_approvals ?? 0;
  if (pendingVisitors > 0) {
    items.push({
      id: "pending-visitors",
      message: `${pendingVisitors} visitor approval${pendingVisitors === 1 ? "" : "s"} waiting`,
      severity: "warning",
      href: `${base}/visitors/approvals`,
    });
  }

  return items;
}

export function societyAddressLine(dashboard: SocietyDashboardBootstrap) {
  const society = dashboard.society;
  if (!society) return "";
  return [
    society.address_line1,
    society.address_line2,
    society.city,
    society.state,
    society.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}
