import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ModelsSocietyResponse, ModelsSocietySubscriptionResponse } from "@/lib/api/generated-api";
import { titleCaseFromSnake } from "@/lib/format";
import type { ResolvedSubscriptionHealth } from "@/lib/subscription-health";

type DashboardSocietyHeaderProps = {
  address?: string;
  society?: ModelsSocietyResponse;
  subscription?: ModelsSocietySubscriptionResponse | null;
  subscriptionHealth?: ResolvedSubscriptionHealth | null;
};

export function DashboardSocietyHeader({
  address,
  society,
  subscription,
  subscriptionHealth,
}: DashboardSocietyHeaderProps) {
  return (
    <section className="rounded-xl border border-border/80 bg-card px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-xl tracking-tight">
              {society?.name ?? "Society"}
            </h2>
            <Badge variant="outline">{titleCaseFromSnake(society?.status)}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {society?.society_code}
            {society?.city ? ` · ${society.city}` : ""}
          </p>
          {address ? (
            <p className="flex items-start gap-2 text-muted-foreground text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{address}</span>
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.12em]">
            Current plan
          </p>
          <p className="font-medium text-sm">
            {subscription?.plan_name ?? "No active plan"}
          </p>
          <Badge
            className="mt-1"
            variant={subscriptionHealth?.is_active ? "default" : "destructive"}
          >
            {titleCaseFromSnake(
              subscriptionHealth?.lifecycle_label ?? subscription?.status ?? "inactive",
            )}
          </Badge>
        </div>
      </div>
    </section>
  );
}
