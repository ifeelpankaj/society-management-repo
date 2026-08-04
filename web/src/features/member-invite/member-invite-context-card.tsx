"use client";

import { Building2, DoorOpen, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModelsPublicFlatMemberInviteView } from "@/lib/api/generated-api";

import {
  formatMemberInviteExpiry,
  formatMemberInviteFlatLabel,
  titleizeMemberRole,
} from "./member-invite-utils";

type MemberInviteContextCardProps = {
  invite: ModelsPublicFlatMemberInviteView;
};

export function MemberInviteContextCard({ invite }: MemberInviteContextCardProps) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{titleizeMemberRole(invite.role)} invite</Badge>
          {invite.expires_at ? (
            <Badge variant="outline">Expires {formatMemberInviteExpiry(invite.expires_at)}</Badge>
          ) : null}
        </div>
        <CardTitle className="text-xl">Join {invite.society_name ?? "your society"}</CardTitle>
        <CardDescription>
          {invite.full_name
            ? `${invite.full_name} was invited to join this flat as ${titleizeMemberRole(invite.role).toLowerCase()}.`
            : "Complete the form below to join this flat."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
          <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Society</p>
            <p className="text-muted-foreground text-sm">{invite.society_name ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
          <DoorOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Flat</p>
            <p className="text-muted-foreground text-sm">{formatMemberInviteFlatLabel(invite)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
          <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Role</p>
            <p className="text-muted-foreground text-sm">{titleizeMemberRole(invite.role)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
