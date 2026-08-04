"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  MemberInviteLoginFormValues,
  MemberInviteRegisterFormValues,
} from "@/features/member-invite/member-invite-join-form";
import { splitFullName } from "@/features/member-invite/member-invite-utils";
import { useGetV1PublicFlatMemberInvitesByTokenQuery } from "@/lib/api/generated-api";
import { usePostV1PublicFlatMemberInvitesByTokenJoinMutation } from "@/lib/api/member-invite-api-extensions";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { buildLoginPayload, toIndianPhone } from "@/lib/validations";

export function useMemberInvitePage(token: string) {
  const normalizedToken = decodeURIComponent(token).trim();
  const [joined, setJoined] = useState(false);

  const inviteQuery = useGetV1PublicFlatMemberInvitesByTokenQuery(
    { token: normalizedToken },
    { skip: !normalizedToken },
  );
  const [joinInvite, joinState] =
    usePostV1PublicFlatMemberInvitesByTokenJoinMutation();

  const invite = inviteQuery.data?.data?.invite ?? null;

  const nameDefaults = useMemo(
    () => splitFullName(invite?.full_name),
    [invite?.full_name],
  );

  const handleRegister = useCallback(
    async (values: MemberInviteRegisterFormValues) => {
      const toastId = toast.loading("Creating your account...");
      const invitePhone = invite?.phone?.trim();
      if (!invitePhone) {
        toast.error(
          "This invite is missing a phone number. Ask the inviter to send a new link.",
          { id: toastId },
        );
        return;
      }

      try {
        const response = await joinInvite({
          token: normalizedToken,
          joinFlatMemberInviteRequest: {
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim() || undefined,
            email: values.email.trim().toLowerCase(),
            password: values.password,
          },
        }).unwrap();
        setJoined(true);
        toast.success(
          getApiMessage(
            response,
            "Welcome! Open the mobile app and sign in with your new account.",
          ),
          { id: toastId },
        );
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not create your account."), {
          id: toastId,
        });
      }
    },
    [invite?.phone, joinInvite, normalizedToken],
  );

  const handleLogin = useCallback(
    async (values: MemberInviteLoginFormValues) => {
      const toastId = toast.loading("Joining flat...");
      try {
        const loginPayload = buildLoginPayload(
          values.identifier,
          values.password,
        );
        const response = await joinInvite({
          token: normalizedToken,
          joinFlatMemberInviteRequest: {
            identifier:
              loginPayload.email ??
              (loginPayload.phone_number
                ? toIndianPhone(loginPayload.phone_number)
                : values.identifier.trim()),
            password: values.password,
          },
        }).unwrap();
        setJoined(true);
        toast.success(
          getApiMessage(response, "You joined the flat. Open the app to sign in."),
          { id: toastId },
        );
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not sign in or join the flat."), {
          id: toastId,
        });
      }
    },
    [joinInvite, normalizedToken],
  );

  const isSubmitting = joinState.isLoading;

  return {
    handleLogin,
    handleRegister,
    invite,
    inviteQuery,
    isSubmitting,
    joined,
    nameDefaults,
  };
}
