import { BadgeCheck, Building2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { setupSteps, trustPoints } from "../get-started.constants";

export function GetStartedHero() {
  return (
    <section className="w-full max-w-2xl space-y-9">
      <div className="space-y-5">
        <Badge
          variant="outline"
          className="h-7 gap-2 rounded-full bg-card/70 px-3"
        >
          <Sparkles className="size-3.5 text-primary" />
          Start your society workspace
        </Badge>

        <div className="space-y-4">
          <h1 className="font-semibold text-4xl text-balance leading-tight md:text-6xl">
            Launch society operations with a cleaner first mile.
          </h1>

          <p className="max-w-xl text-muted-foreground text-base leading-7">
            Create your admin account, set up your society, and start managing
            flats, resident records, claims, and staff from one clean workspace.
          </p>
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        {trustPoints.map((point) => (
          <div
            key={point}
            className="rounded-lg border border-border/70 bg-card/55 p-4 shadow-sm"
          >
            <BadgeCheck className="mb-3 size-4 text-primary" />
            <span className="font-medium leading-5">{point}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/70 bg-background/45 p-2">
        {setupSteps.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-4 rounded-md px-3 py-3"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
              {index + 1}
            </span>
            <span className="font-medium text-sm">{step}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 border-border/70 border-t pt-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent-foreground">
          <Building2 className="size-5" />
        </div>
        <p className="max-w-lg text-muted-foreground text-sm leading-6">
          After email verification, Gatezy signs the admin in, fetches
          bootstrap, and opens the onboarding or dashboard route returned by the
          API.
        </p>
      </div>
    </section>
  );
}
