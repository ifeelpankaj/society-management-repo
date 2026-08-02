"use client";

import { CheckCircle2, DoorClosed, LogIn } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModelsVisitorEntry } from "@/lib/api/generated-api";

import {
  formatInviteFlatLabel,
  titleizePurpose,
} from "./visitor-invite-utils";

export type VisitorInviteStatusView = "checked_in" | "checked_out" | "closed";

type VisitorInviteStatusProps = {
  entry?: ModelsVisitorEntry;
  view: VisitorInviteStatusView;
};

const statusContent: Record<
  VisitorInviteStatusView,
  { description: string; icon: typeof LogIn; title: string }
> = {
  checked_in: {
    description:
      "You are already inside the society. Show your ID at the gate if security asks.",
    icon: LogIn,
    title: "You're checked in",
  },
  checked_out: {
    description: "Your visit is complete. Thank you for visiting.",
    icon: CheckCircle2,
    title: "Visit complete",
  },
  closed: {
    description:
      "This visit is no longer active. Contact the resident if you still need access.",
    icon: DoorClosed,
    title: "Visit unavailable",
  },
};

export function VisitorInviteStatus({ entry, view }: VisitorInviteStatusProps) {
  const content = statusContent[view];
  const Icon = content.icon;
  const visitorName = entry?.visitor?.full_name ?? "Visitor";
  const flatLabel = formatInviteFlatLabel({
    block: entry?.flat?.block,
    flat_number: entry?.flat?.flat_number,
    floor: entry?.flat?.floor,
  });

  return (
    <Card className="border-slate-200 bg-slate-50/40">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          <Icon className="size-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">{content.title}</CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary">{visitorName}</Badge>
          <Badge variant="outline">{flatLabel}</Badge>
          {entry?.purpose ? (
            <Badge variant="outline">{titleizePurpose(entry.purpose)}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pb-8" />
    </Card>
  );
}
