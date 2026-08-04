"use client";

import { Loader2 } from "lucide-react";

import { AppLoader } from "@/components/shared/app-loader";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MemberInviteContextCard } from "@/features/member-invite/member-invite-context-card";
import { MemberInviteJoinForm } from "@/features/member-invite/member-invite-join-form";
import { MemberInviteSuccess } from "@/features/member-invite/member-invite-success";
import { useMemberInvitePage } from "@/features/member-invite/use-member-invite-page";
import { getApiErrorMessage } from "@/lib/api-message";

type MemberInvitePageProps = {
  token: string;
};

export function MemberInvitePage({ token }: MemberInvitePageProps) {
  const {
    handleLogin,
    handleRegister,
    invite,
    inviteQuery,
    isSubmitting,
    joined,
    nameDefaults,
  } = useMemberInvitePage(token);

  if (inviteQuery.isLoading && !invite) {
    return <AppLoader label="Loading member invite..." />;
  }

  if (inviteQuery.isError || !invite) {
    return (
      <EmptyState
        description={getApiErrorMessage(
          inviteQuery.error,
          "This invite may be expired, already used, or invalid.",
        )}
        title="Invite unavailable"
      />
    );
  }

  if (joined) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        <MemberInviteSuccess invite={invite} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <MemberInviteContextCard invite={invite} />

      <Card>
        <CardHeader>
          <CardTitle>Join this flat</CardTitle>
          <CardDescription>
            Create an account or sign in with an existing one. Your session on
            this browser will not be changed — use the mobile app to sign in
            afterward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MemberInviteJoinForm
            defaultEmail={invite.email ?? ""}
            defaultFirstName={nameDefaults.firstName}
            defaultLastName={nameDefaults.lastName}
            isLoading={isSubmitting}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </CardContent>
      </Card>
    </div>
  );
}
