import { generatedApi } from "@/lib/api/generated-api";
import type { AppDispatch } from "@/store/store";
import { clearAuth } from "./auth-slice";

export function clearClientSession(dispatch: AppDispatch) {
  dispatch(clearAuth());
  dispatch(generatedApi.util.resetApiState());
}
