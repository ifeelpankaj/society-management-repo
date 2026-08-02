"use client";

import { Building2, DoorOpen, Loader2, ShieldAlert } from "lucide-react";

import { AppLoader } from "@/components/shared/app-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api-message";

import { useVisitorInvitePage } from "./use-visitor-invite-page";
import { VisitorInviteForm } from "./visitor-invite-form";
import { VisitorInviteStatus } from "./visitor-invite-status";
import { VisitorInviteSuccess } from "./visitor-invite-success";
import {
  formatInviteExpiry,
  formatInviteFlatLabel,
  titleizePurpose,
} from "./visitor-invite-utils";

type VisitorInvitePageProps = {
  token: string;
};

function isStatusView(
  view: string | undefined,
): view is "checked_in" | "checked_out" | "closed" {
  return view === "checked_in" || view === "checked_out" || view === "closed";
}

export function VisitorInvitePage({ token }: VisitorInvitePageProps) {
  const {
    displayResult,
    form,
    handleSubmit,
    invite,
    inviteQuery,
    pageData,
    pageView,
    showOptional,
    setShowOptional,
    submitState,
    updateField,
  } = useVisitorInvitePage(token);

  if (inviteQuery.isLoading && !displayResult) {
    return <AppLoader label="Loading visitor invite..." />;
  }

  if (displayResult) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <VisitorInviteSuccess
          entry={displayResult.entry}
          qr={displayResult.qr}
        />
      </div>
    );
  }

  if (isStatusView(pageView)) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <VisitorInviteStatus entry={pageData?.entry} view={pageView} />
      </div>
    );
  }

  if (inviteQuery.isError) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4 py-10">
        <EmptyState
          description={getApiErrorMessage(
            inviteQuery.error,
            "This invite link is invalid, expired, or has already been used.",
          )}
          icon={<ShieldAlert className="size-5" />}
          title="Invite unavailable"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 space-y-2 text-center">
        <Badge className="mx-auto" variant="secondary">
          Visitor entry
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Complete your visit details
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details to receive a gate QR code for check-in.
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="size-5 text-teal-700" />
            {invite?.society_name ?? "Society"}
          </CardTitle>
          <CardDescription className="space-y-2">
            <span className="flex items-center gap-2">
              <DoorOpen className="size-4" />
              {formatInviteFlatLabel(invite)}
            </span>
            <span className="block">
              Visiting as{" "}
              <strong>{titleizePurpose(invite?.purpose)}</strong>
              {invite?.expires_at ? (
                <>
                  {" "}
                  · invite expires {formatInviteExpiry(invite.expires_at)}
                </>
              ) : null}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            Phone number is required unless you provide an email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VisitorInviteForm
            email={form.email}
            fullName={form.fullName}
            isSubmitting={submitState.isLoading}
            notes={form.notes}
            phoneNumber={form.phoneNumber}
            showOptional={showOptional}
            vehicleNumber={form.vehicleNumber}
            onEmailChange={(value) => updateField("email", value)}
            onFullNameChange={(value) => updateField("fullName", value)}
            onNotesChange={(value) => updateField("notes", value)}
            onPhoneNumberChange={(value) => updateField("phoneNumber", value)}
            onSubmit={handleSubmit}
            onToggleOptional={() => setShowOptional((current) => !current)}
            onVehicleNumberChange={(value) => updateField("vehicleNumber", value)}
          />
        </CardContent>
      </Card>

      {submitState.isLoading ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Creating your entry QR...
        </div>
      ) : null}
    </div>
  );
}
