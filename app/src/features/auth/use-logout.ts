import { useRouter } from "expo-router";

import { usePostV1AuthLogoutMutation } from "@/lib/api/generated-api";

import { useAuth } from "./use-auth";

export function useLogout() {
  const router = useRouter();
  const { signOutLocal } = useAuth();
  const [logout, logoutState] = usePostV1AuthLogoutMutation();

  const signOut = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Session may already be cleared server-side.
    } finally {
      await signOutLocal();
      router.replace("/");
    }
  };

  return { signOut, isLoading: logoutState.isLoading };
}
