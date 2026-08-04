import { BadgeCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModelsPlanResponse } from "@/lib/api/generated-api";
import {
  formatMoneyINR,
  formatNumberIN,
  titleCaseFromSnake,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ResolvedSubscriptionHealth } from "@/lib/subscription-health";

type DashboardUpgradePlansProps = {
  planAds: ModelsPlanResponse[];
  subscriptionHealth?: ResolvedSubscriptionHealth | null;
};

function featureLabels(features: unknown) {
  if (!features || typeof features !== "object") return [];
  return Object.entries(features as Record<string, unknown>)
    .filter(([, value]) => value === true || typeof value === "string")
    .slice(0, 3)
    .map(([key, value]) =>
      typeof value === "string"
        ? value
        : titleCaseFromSnake(key.replaceAll("_", " ")),
    );
}

export function DashboardUpgradePlans({
  planAds,
  subscriptionHealth,
}: DashboardUpgradePlansProps) {
  if (planAds.length === 0) return null;

  const deemphasize =
    subscriptionHealth?.is_active && !subscriptionHealth?.is_expiring_soon;

  return (
    <Card className={cn(deemphasize && "opacity-90")}>
      <CardHeader>
        <CardTitle>Upgrade plans</CardTitle>
        <CardDescription>
          {formatNumberIN(planAds.length)} active upgrade options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {planAds.slice(0, 4).map((plan) => {
            const features = featureLabels(plan.features);
            return (
              <div
                className="rounded-lg border border-border bg-background p-4"
                key={plan.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatMoneyINR(plan.price_amount_paise, plan.currency)} /{" "}
                      {titleCaseFromSnake(plan.billing_cycle)}
                    </p>
                  </div>
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <span>{formatNumberIN(plan.max_flats)} flats</span>
                  <span>{formatNumberIN(plan.max_admins)} admins</span>
                  <span>{formatNumberIN(plan.max_staff)} staff</span>
                </div>
                {features.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <Badge key={`${plan.id}-${feature}-${index}`} variant="outline">
                        <BadgeCheck className="size-3" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
