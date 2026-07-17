"use client";

import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import {
  type ModelsLoginRequest,
  usePostV1AuthLoginMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { useCompleteAuthSession } from "@/lib/hooks/auth-hooks";
import { buildLoginPayload } from "@/lib/validations";

import type { LoginFormValues } from "../login.types";

export function useLoginFlow() {
  const completeAuthSession = useCompleteAuthSession();
  const [login, { isLoading }] = usePostV1AuthLoginMutation();

  const loginUser: SubmitHandler<LoginFormValues> = async (values) => {
    const toastId = toast.loading("Signing you in...");

    try {
      const response = await login({
        modelsLoginRequest: buildLoginPayload(
          values.identifier,
          values.password,
        ) as ModelsLoginRequest,
      }).unwrap();

      const user = response.data?.user ?? null;
      const route = await completeAuthSession(user);

      toast.success(getApiMessage(response, "Welcome back."), {
        id: toastId,
        description: route.startsWith("/dashboard/")
          ? "Opening your society workspace."
          : "Redirecting you now.",
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid login credentials."), {
        id: toastId,
      });
    }
  };

  return {
    loginUser,
    isLoading,
  };
}
