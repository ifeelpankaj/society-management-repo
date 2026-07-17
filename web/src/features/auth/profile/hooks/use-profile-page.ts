"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { useAdminSocietySession } from "@/features/admin/society/hooks/use-admin-society";
import { resolveAuthenticatedRoute } from "@/features/auth/auth-routing";
import { clearClientSession } from "@/features/auth/logout";
import {
  useGetV1AuthProfileQuery,
  usePostV1AuthChangePasswordMutation,
  usePostV1AuthLogoutMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { useAppDispatch } from "@/store/store";

import type { ChangePasswordValues } from "../profile.types";
import { getDashboardActionLabel } from "../profile-utils";

export function useProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [origin, setOrigin] = useState("");
  const [host, setHost] = useState("");

  const { data, isLoading, isFetching } = useGetV1AuthProfileQuery();

  const [logout, { isLoading: isLoggingOut }] = usePostV1AuthLogoutMutation();

  const [changePassword, { isLoading: isChangingPassword }] =
    usePostV1AuthChangePasswordMutation();

  const user = data?.data?.user;
  const {
    memberships,
    selectedSociety: society,
    isFetching: isFetchingSociety,
  } = useAdminSocietySession({ skip: !user || user.global_role !== "user" });

  const dashboardRoute = user
    ? resolveAuthenticatedRoute(user, memberships)
    : null;

  const dashboardActionLabel = getDashboardActionLabel(dashboardRoute);

  const claimLink = society?.society_code
    ? `${origin}/claim/${society.society_code}`
    : "";

  const qrUrl = useMemo(() => {
    if (!claimLink) return "";

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(
      claimLink,
    )}`;
  }, [claimLink]);

  useEffect(() => {
    setOrigin(window.location.origin);
    setHost(window.location.host);
  }, []);

  const handleLogout = async () => {
    const toastId = toast.loading("Signing you out...");

    try {
      const response = await logout().unwrap();

      clearClientSession(dispatch);

      toast.success(getApiMessage(response, "Signed out successfully."), {
        id: toastId,
      });

      router.replace("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not sign out."), {
        id: toastId,
      });
    }
  };

  const handleChangePassword: SubmitHandler<ChangePasswordValues> = async (
    values,
  ) => {
    const toastId = toast.loading("Updating password...");

    try {
      const response = await changePassword({
        modelsChangePasswordRequest: values,
      }).unwrap();

      toast.success(getApiMessage(response, "Password changed successfully."), {
        id: toastId,
      });

      clearClientSession(dispatch);
      router.replace("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not change password."), {
        id: toastId,
      });
    }
  };

  const handleCopyLink = async () => {
    if (!claimLink) return;

    await navigator.clipboard.writeText(claimLink);
    toast.success("Claim link copied.");
  };

  return {
    user,
    society,
    dashboardRoute,
    dashboardActionLabel,
    claimLink,
    host,
    qrUrl,

    isLoading,
    isFetching,
    isFetchingSociety,
    isLoggingOut,
    isChangingPassword,

    handleLogout,
    handleChangePassword,
    handleCopyLink,
  };
}
