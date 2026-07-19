import { generatedApi } from "@/lib/api/generated-api";
import {
  getCachedWebPushToken,
  unregisterWebPushToken,
} from "@/lib/notifications/register-web-push";
import type { AppDispatch } from "@/store/store";

import { clearAuth } from "./auth-slice";

export function clearClientSession(dispatch: AppDispatch) {
  dispatch(clearAuth());
  dispatch(generatedApi.util.resetApiState());
}

async function unregisterWebDeviceToken(dispatch: AppDispatch) {
  const token = getCachedWebPushToken();
  if (!token) {
    return;
  }

  try {
    await dispatch(
      generatedApi.endpoints.deleteV1MeDeviceTokens.initiate({
        modelsUnregisterDeviceTokenRequest: { token },
      }),
    ).unwrap();
  } catch {
    // Token may already be removed server-side.
  }

  await unregisterWebPushToken();
}

export async function completeClientSignOut(dispatch: AppDispatch) {
  await unregisterWebDeviceToken(dispatch);
  clearClientSession(dispatch);
}
