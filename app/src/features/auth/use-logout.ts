import { useRouter } from "expo-router";

import {
  useDeleteV1MeDeviceTokensMutation,
  usePostV1AuthLogoutMutation,
} from "@/lib/api/generated-api";
import { setDevicePushToken } from "@/redux/notificationSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import { useAuth } from "./use-auth";

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const devicePushToken = useAppSelector((state) => state.notifications.devicePushToken);
  const { signOutLocal } = useAuth();
  const [logout, logoutState] = usePostV1AuthLogoutMutation();
  const [unregisterToken] = useDeleteV1MeDeviceTokensMutation();

  const signOut = async () => {
    try {
      if (devicePushToken) {
        try {
          await unregisterToken({
            modelsUnregisterDeviceTokenRequest: { token: devicePushToken },
          }).unwrap();
        } catch {
          // Token may already be removed server-side.
        }
      }

      await logout().unwrap();
    } catch {
      // Session may already be cleared server-side.
    } finally {
      dispatch(setDevicePushToken(null));
      await signOutLocal();
      router.replace("/");
    }
  };

  return { signOut, isLoading: logoutState.isLoading };
}
