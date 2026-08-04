"use client";

import Link from "next/link";
import { CheckCircle2, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModelsPublicFlatMemberInviteView } from "@/lib/api/generated-api";

import { formatMemberInviteFlatLabel, titleizeMemberRole } from "./member-invite-utils";

type MemberInviteSuccessProps = {
  invite: ModelsPublicFlatMemberInviteView;
};

export function MemberInviteSuccess({ invite }: MemberInviteSuccessProps) {
  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader>
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="size-5" />
          <CardTitle>You&apos;re in</CardTitle>
        </div>
        <CardDescription>
          You joined {formatMemberInviteFlatLabel(invite)} at {invite.society_name ?? "the society"}{" "}
          as {titleizeMemberRole(invite.role).toLowerCase()}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="sm:flex-1">
          <Link href="/download-app">
            <Smartphone className="size-4" />
            Download the app
          </Link>
        </Button>
        <Button asChild className="sm:flex-1" variant="secondary">
          <Link href="/login">Sign in later</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
