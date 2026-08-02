"use client";

import { CheckCircle2, Loader2, QrCode } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ModelsQrTokenResponse,
  ModelsVisitorEntry,
} from "@/lib/api/generated-api";

import {
  buildVisitorQrImageUrl,
  formatInviteExpiry,
  formatInviteFlatLabel,
  titleizePurpose,
} from "./visitor-invite-utils";

type VisitorInviteSuccessVariant = "submitted" | "recovered";

type VisitorInviteSuccessProps = {
  entry?: ModelsVisitorEntry;
  isRetrying?: boolean;
  onRetry?: () => void;
  qr?: ModelsQrTokenResponse;
  variant?: VisitorInviteSuccessVariant;
};

const variantContent: Record<
  VisitorInviteSuccessVariant,
  { description: string; footer: string; title: string }
> = {
  submitted: {
    title: "You're approved to enter",
    description:
      "Show this gate QR code at security — not the invite link you received.",
    footer:
      "Keep this screen open or take a screenshot. Security will scan this gate QR when you arrive — do not share your original invite link for check-in.",
  },
  recovered: {
    title: "Your gate pass",
    description: "Scan this QR at security when you arrive.",
    footer:
      "Reopening this link refreshes your gate QR. Keep this screen open or take a screenshot for check-in.",
  },
};

export function VisitorInviteSuccess({
  entry,
  isRetrying = false,
  onRetry,
  qr,
  variant = "submitted",
}: VisitorInviteSuccessProps) {
  const qrImageUrl = useMemo(() => {
    if (!qr?.token) {
      return "";
    }

    return buildVisitorQrImageUrl(qr.token);
  }, [qr?.token]);

  const content = variantContent[variant];
  const visitorName = entry?.visitor?.full_name ?? "Visitor";
  const flatLabel = formatInviteFlatLabel({
    block: entry?.flat?.block,
    flat_number: entry?.flat?.flat_number,
    floor: entry?.flat?.floor,
  });

  return (
    <Card className="border-emerald-200 bg-emerald-50/40">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-6" />
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
      <CardContent className="flex flex-col items-center gap-4 pb-8">
        {qrImageUrl ? (
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Visitor entry QR code"
              className="size-[280px]"
              height={280}
              src={qrImageUrl}
              width={280}
            />
          </div>
        ) : (
          <div className="flex size-[280px] flex-col items-center justify-center gap-3 rounded-2xl border bg-white text-muted-foreground">
            {isRetrying ? (
              <>
                <Loader2 className="size-10 animate-spin" />
                <p className="text-sm">Loading QR...</p>
              </>
            ) : (
              <>
                <QrCode className="size-10" />
                <p className="text-sm">Gate QR unavailable</p>
                {onRetry ? (
                  <Button size="sm" variant="outline" onClick={onRetry}>
                    Try again
                  </Button>
                ) : null}
              </>
            )}
          </div>
        )}

        {qr?.expires_at ? (
          <p className="text-center text-sm text-muted-foreground">
            QR valid until {formatInviteExpiry(qr.expires_at)}
          </p>
        ) : null}

        <p className="max-w-sm text-center text-sm text-muted-foreground">
          {content.footer}
        </p>
      </CardContent>
    </Card>
  );
}
