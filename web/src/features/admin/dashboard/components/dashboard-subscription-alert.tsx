import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { formatNumberIN } from "@/lib/format";
import type { ResolvedSubscriptionHealth } from "@/lib/subscription-health";
import { cn } from "@/lib/utils";

type DashboardSubscriptionAlertProps = {
  hasSubscription?: boolean;
  subscriptionHealth?: ResolvedSubscriptionHealth | null;
};

export function DashboardSubscriptionAlert({
  hasSubscription,
  subscriptionHealth,
}: DashboardSubscriptionAlertProps) {
  const lifecycle = subscriptionHealth?.lifecycle_label;
  const days = subscriptionHealth?.days_until_expiry;

  if (!hasSubscription || lifecycle === "none") {
    return (
      <AlertShell tone="danger" icon={AlertTriangle}>
        <p className="font-medium text-sm">No active subscription</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Contact support to assign or renew your society plan.
        </p>
      </AlertShell>
    );
  }

  if (lifecycle === "expired" || lifecycle === "cancelled") {
    return (
      <AlertShell tone="danger" icon={AlertTriangle}>
        <p className="font-medium text-sm">
          {lifecycle === "cancelled" ? "Subscription cancelled" : "Plan expired"}
        </p>
        <p className="mt-1 text-muted-foreground text-sm">
          Renew your subscription to restore full workspace access.
        </p>
      </AlertShell>
    );
  }

  if (subscriptionHealth?.is_expiring_soon || lifecycle === "expiring_soon") {
    return (
      <AlertShell tone="warning" icon={AlertTriangle}>
        <p className="font-medium text-sm">Plan expiring soon</p>
        <p className="mt-1 text-muted-foreground text-sm">
          {days != null
            ? `${formatNumberIN(days)} day${days === 1 ? "" : "s"} remaining on your current plan.`
            : "Your plan is nearing its end date."}
        </p>
      </AlertShell>
    );
  }

  if (lifecycle === "active" || lifecycle === "trial") {
    return (
      <AlertShell tone="success" icon={CheckCircle2}>
        <p className="font-medium text-sm">
          {lifecycle === "trial" ? "Trial plan active" : "Plan active"}
        </p>
        <p className="mt-1 text-muted-foreground text-sm">
          {days != null
            ? `${formatNumberIN(days)} day${days === 1 ? "" : "s"} until renewal.`
            : "Your society subscription is active."}
        </p>
      </AlertShell>
    );
  }

  return (
    <AlertShell tone="neutral" icon={CheckCircle2}>
      <p className="font-medium text-sm">Subscription status</p>
      <p className="mt-1 text-muted-foreground text-sm">
        {days != null
          ? `${formatNumberIN(days)} day${days === 1 ? "" : "s"} until plan end.`
          : "Review your plan details below."}
      </p>
    </AlertShell>
  );
}

function AlertShell({
  children,
  icon: Icon,
  tone,
}: {
  children: ReactNode;
  icon: typeof AlertTriangle;
  tone: "danger" | "warning" | "success" | "neutral";
}) {
  const toneClass = {
    danger: "border-destructive/40 bg-destructive/5",
    warning: "border-amber-500/40 bg-amber-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
    neutral: "border-border bg-muted/30",
  }[tone];

  const iconClass = {
    danger: "text-destructive",
    warning: "text-amber-600",
    success: "text-emerald-600",
    neutral: "text-muted-foreground",
  }[tone];

  return (
    <div className={cn("rounded-xl border px-4 py-3", toneClass)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-4 shrink-0", iconClass)} />
        <div>{children}</div>
      </div>
    </div>
  );
}
