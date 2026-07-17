import { Building2, CheckCircle2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const valuePoints = [
  "Resident onboarding",
  "Flat management",
  "Society operations",
  "Claim approvals",
];

const stats = [
  { label: "Session", value: "Cookie secure" },
  { label: "Routing", value: "Bootstrap ready" },
  { label: "Access", value: "Role aware" },
];

export function LoginHero() {
  return (
    <section className="w-full max-w-2xl space-y-9">
      <div className="space-y-5">
        <Badge
          variant="outline"
          className="h-7 gap-2 rounded-full bg-card/70 px-3"
        >
          <ShieldCheck className="size-3.5 text-primary" />
          Gatezy secure access
        </Badge>

        <div className="space-y-4">
          <h1 className="font-semibold text-4xl text-balance leading-tight md:text-6xl">
            Smart society management for modern communities.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground leading-7">
            Open a calm operations workspace for residents, flats, claims, and
            daily society work.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border/70 bg-card/55 p-4 shadow-sm"
          >
            <p className="text-muted-foreground text-xs">{item.label}</p>
            <p className="mt-1 font-semibold text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 text-sm text-foreground/85 sm:grid-cols-2">
        {valuePoints.map((point) => (
          <div key={point} className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 text-primary" strokeWidth={2} />
            <span>{point}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 border-border/70 border-t pt-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm">Workspace routing after login</p>
          <p className="max-w-lg text-muted-foreground text-sm leading-6">
            Bootstrap decides the best destination for each role and society
            session.
          </p>
        </div>
      </div>
    </section>
  );
}
