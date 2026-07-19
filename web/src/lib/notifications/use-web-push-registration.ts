"use client";

import { useEffect } from "react";

import {
  useDeleteV1MeDeviceTokensMutation,
  usePostV1MeDeviceTokensMutation,
} from "@/lib/api/generated-api";
import { useAppSelector } from "@/store/store";

import {
  getCachedWebPushToken,
  registerWebPushToken,
  unregisterWebPushToken,
} from "./register-web-push";

async function syncWebPushToken(
  registerToken: ReturnType<typeof usePostV1MeDeviceTokensMutation>[0],
) {
  const token = await registerWebPushToken();
  if (!token) {
    return;
  }

  await registerToken({
    modelsRegisterDeviceTokenRequest: {
      token,
      platform: "web",
    },
  }).unwrap();
}

export function useWebPushRegistration(isAuthenticated: boolean) {
  const [registerToken] = usePostV1MeDeviceTokensMutation();
  const [unregisterToken] = useDeleteV1MeDeviceTokensMutation();
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    void syncWebPushToken(registerToken).catch(() => undefined);
  }, [isAuthenticated, registerToken, userId]);

  return {
    unregisterWebPushToken: async () => {
      const token = getCachedWebPushToken();
      if (token) {
        try {
          await unregisterToken({
            modelsUnregisterDeviceTokenRequest: { token },
          }).unwrap();
        } catch {
          // Token may already be removed server-side.
        }
      }

      await unregisterWebPushToken();
    },
  };
}
