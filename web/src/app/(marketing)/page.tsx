import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CreditCard,
  Home,
  PlayCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { PageShell } from "@/components/shared/page-shell";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Home",
  "Set up your society, manage flats and residents, and run daily operations from one workspace.",
);

const benefits = [
  "No credit card required",
  "Designed for Indian societies",
  "Admin, guard, staff, and resident access",
];

const previewMetrics = [
  {
    label: "Active flats",
    value: "128",
    helper: "Configured in the society workspace",
  },
  {
    label: "Pending claims",
    value: "04",
    helper: "Resident flat requests awaiting review",
  },
  {
    label: "Staff accounts",
    value: "12",
    helper: "Active team access for operations",
  },
];

const steps = [
  {
    title: "Create your society",
    description: "Set up the community profile and admin workspace.",
    icon: Building2,
  },
  {
    title: "Invite people",
    description: "Add residents and staff with role-based access.",
    icon: Users,
  },
  {
    title: "Run daily operations",
    description: "Manage flats, residents, claims, and setup tasks live.",
    icon: BadgeCheck,
  },
];

const capabilities = [
  {
    title: "Flat inventory",
    description: "Create flats, track occupancy, and block unavailable units.",
    icon: Home,
  },
  {
    title: "Resident onboarding",
    description: "Invite residents and connect them to their flats securely.",
    icon: Users,
  },
  {
    title: "Subscription visibility",
    description: "See the active plan, limits, and usage from the dashboard.",
    icon: CreditCard,
  },
  {
    title: "Flat claims",
    description: "Review pending resident requests and approve or reject them.",
    icon: BadgeCheck,
  },
  {
    title: "Staff access",
    description: "Create staff accounts during setup and keep roles scoped.",
    icon: ShieldCheck,
  },
  {
    title: "Admin routing",
    description: "Open the right workspace for each role after sign-in.",
    icon: Building2,
  },
];

function parseTimeToSeconds(time?: string | null) {
  if (!time) {
    return undefined;
  }

  if (/^\d+$/.test(time)) {
    return Number(time);
  }

  if (/^\d+s$/.test(time)) {
    return Number(time.replace(/s$/, ""));
  }

  const hours = /(?:(\d+)h)/.exec(time)?.[1];
  const minutes = /(?:(\d+)m)/.exec(time)?.[1];
  const seconds = /(?:(\d+)s)/.exec(time)?.[1];

  if (hours || minutes || seconds) {
    return (
      Number(hours || 0) * 3600 +
      Number(minutes || 0) * 60 +
      Number(seconds || 0)
    );
  }

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
    const parts = time.split(":").map(Number).reverse();
    return (parts[0] || 0) + (parts[1] || 0) * 60 + (parts[2] || 0) * 3600;
  }

  return undefined;
}

function getYoutubeEmbedUrl(url: string) {
  if (!url) {
    return url;
  }

  try {
    const parsed = new URL(url, "https://www.youtube.com");
    const params = parsed.searchParams;
    const hashTime = parsed.hash.match(/(?:#|&)t=(.+)/)?.[1];
    const timeParam =
      parseTimeToSeconds(hashTime) ??
      parseTimeToSeconds(params.get("t") || params.get("start"));
    const list = params.get("list");
    const query = new URLSearchParams();

    if (timeParam) {
      query.set("start", String(timeParam));
    }

    if (list) {
      query.set("list", list);
    }

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1).split("/")[0];
      const embed = `https://www.youtube.com/embed/${id}`;
      return query.toString() ? `${embed}?${query.toString()}` : embed;
    }

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtube-nocookie.com")
    ) {
      if (parsed.pathname.includes("/embed/")) {
        const embed = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
        return query.toString() ? `${embed}?${query.toString()}` : embed;
      }

      const videoId = params.get("v");
      if (videoId) {
        const embed = `https://www.youtube.com/embed/${videoId}`;
        return query.toString() ? `${embed}?${query.toString()}` : embed;
      }
    }
  } catch {
    return url;
  }

  return url;
}

export default function Page() {
  const trialMonths = appConfig.trialMonths;
  const priceDisplay = new Intl.NumberFormat("en-IN").format(
    appConfig.pricePerFlat,
  );
  const demoUrl = getYoutubeEmbedUrl(appConfig.demoVideoUrl);

  return (
    <PageShell
      size="full"
      background="tinted"
      className="gap-20 py-8 sm:py-10 lg:py-12"
    >
      <section className="mx-auto grid min-h-[calc(100vh-12rem)] w-full max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-5">
            <StatusBadge status="active" className="capitalize-none" />
            <div className="space-y-4">
              <h1 className="font-semibold text-4xl text-balance text-foreground leading-tight md:text-6xl">
                Get your society running smoother from day one.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground leading-7 md:text-lg">
                Gatezy brings society setup, flat inventory, resident records,
                flat claims, and staff access into one calm workspace for admins
                and teams.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/get-started">
                Start free for {trialMonths} months
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#demo">
                <PlayCircle className="size-4" />
                Watch demo
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 text-muted-foreground text-sm sm:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 border-border border-y py-8 lg:border-y-0 lg:border-l lg:py-4 lg:pl-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Live preview</p>
              <h2 className="font-semibold text-xl text-foreground">
                Society operations pulse
              </h2>
            </div>
            <StatusBadge status="active" />
          </div>

          <div className="divide-y divide-border">
            {previewMetrics.map((metric) => (
              <div
                key={metric.label}
                className="grid grid-cols-[auto_1fr] gap-x-5 py-5"
              >
                <div className="font-semibold text-3xl text-foreground">
                  {metric.value}
                </div>
                <div>
                  <p className="font-medium text-foreground">{metric.label}</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {metric.helper}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="demo"
        className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <PageHeader
          eyebrow="Product walkthrough"
          title="See the admin workflow in context"
          description="A quick look at how Gatezy connects setup, resident records, flats, and approvals without adding noise."
          actions={
            <Button asChild variant="outline">
              <a href={appConfig.demoVideoUrl} target="_blank" rel="noreferrer">
                Open video
              </a>
            </Button>
          }
        />

        <div className="overflow-hidden rounded-lg border border-border bg-muted">
          <div className="relative aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={demoUrl}
              title={appConfig.demoVideoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8">
        <PageHeader
          eyebrow="How it works"
          title="A clear start for every society"
          description="The setup flow stays practical, so admins can launch operations without a long implementation cycle."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <SectionCard key={step.title} contentClassName="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-muted-foreground text-sm">
                    Step {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-6">
                    {step.description}
                  </p>
                </div>
              </SectionCard>
            );
          })}
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <PageHeader
          eyebrow="Capabilities"
          title="Everything needed for everyday society operations"
          description="Focused modules for the teams who manage flats, resident records, claim approvals, and staff access."
        />

        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {capabilities.map((capability) => {
            const Icon = capability.icon;

            return (
              <div key={capability.title} className="flex gap-4">
                <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {capability.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm leading-6">
                    {capability.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="pricing"
        className="mx-auto grid w-full max-w-7xl gap-8 border-border border-y py-10 lg:grid-cols-[1fr_auto] lg:items-center"
      >
        <div>
          <p className="text-muted-foreground text-sm">Pricing preview</p>
          <h2 className="mt-2 font-semibold text-3xl text-foreground">
            Start free, then pay per flat.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-6">
            Your first {trialMonths} months are free. After that, pricing starts
            at Rs. {priceDisplay} per flat per month, so costs stay aligned with
            society size.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/get-started">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#demo">Watch demo</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl pb-8 text-center">
        <p className="text-muted-foreground text-sm">
          Ready to simplify your society operations?
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl font-semibold text-3xl text-balance text-foreground">
          Launch the workspace your admins, guards, and residents can rely on.
        </h2>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg">
            <Link href="/get-started">
              Start free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
