"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  isMobileOnlyMembership,
  isResidentRole,
} from "@/features/auth/auth-routing";
import { completeClientSignOut } from "@/features/auth/logout";
import {
  useGetV1AuthProfileQuery,
  useGetV1SocietiesMyQuery,
  usePostV1AuthLogoutMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { useAppDispatch } from "@/store/store";

export function useDownloadAppPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data: profileData, isLoading: isLoadingProfile } =
    useGetV1AuthProfileQuery();
  const user = profileData?.data?.user ?? null;

  const { data: societiesData, isLoading: isLoadingSocieties } =
    useGetV1SocietiesMyQuery(undefined, {
      skip: !user || user.global_role !== "user",
    });
  const memberships = societiesData?.data?.societies ?? [];

  const [logout, { isLoading: isLoggingOut }] = usePostV1AuthLogoutMutation();

  const mobileMemberships = memberships.filter(isMobileOnlyMembership);
  const isResident = mobileMemberships.some((membership) =>
    isResidentRole(membership.member?.role),
  );
  const roleLabel = isResident ? "Resident" : "Guard";

  const handleLogout = async () => {
    const toastId = toast.loading("Signing you out...");

    try {
      const response = await logout().unwrap();
      await completeClientSignOut(dispatch);
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

  return {
    user,
    roleLabel,
    isLoading: isLoadingProfile || isLoadingSocieties,
    isLoggingOut,
    handleLogout,
  };
}
