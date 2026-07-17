import { useRouter } from "expo-router";

import { usePostV1AuthLogoutMutation } from "@/lib/api/generated-api";
import { useAppDispatch } from "@/redux/hooks";
import { clearWorkspaceSelection } from "@/redux/appSlice";
import { clearAuth } from "@/redux/authSlice";
import { baseApi } from "@/redux/queries/baseApi";

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, logoutState] = usePostV1AuthLogoutMutation();

  const signOut = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Session may already be cleared server-side.
    } finally {
      dispatch(clearAuth());
      dispatch(clearWorkspaceSelection());
      dispatch(baseApi.util.resetApiState());
      router.replace("/");
    }
  };

  return { signOut, isLoading: logoutState.isLoading };
}
