"use client";

import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import {
  type ModelsLoginRequest,
  usePostV1AuthLoginMutation,
  usePostV1AuthRegisterMutation,
  usePostV1AuthResendOtpMutation,
  usePostV1AuthVerifyOtpMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { useCompleteAuthSession } from "@/lib/hooks/auth-hooks";
import { toIndianPhone } from "@/lib/validations";

import type { GetStartedFormValues, OtpValues } from "../get-started.types";

export function useGetStartedFlow() {
  const completeAuthSession = useCompleteAuthSession();

  const [createdAccount, setCreatedAccount] =
    useState<GetStartedFormValues | null>(null);

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const [registerAccount, { isLoading: isCreating }] =
    usePostV1AuthRegisterMutation();

  const [login, { isLoading: isSigningIn }] = usePostV1AuthLoginMutation();

  const [verifyOtp, { isLoading: isVerifying }] =
    usePostV1AuthVerifyOtpMutation();

  const [resendOtp, { isLoading: isResending }] =
    usePostV1AuthResendOtpMutation();

  const registerAdmin: SubmitHandler<GetStartedFormValues> = async (values) => {
    const { confirmPassword: _confirmPassword, ...registerValues } = values;

    const toastId = toast.loading("Creating account...");

    try {
      const response = await registerAccount({
        modelsRegisterRequest: {
          ...registerValues,
          phone_number: toIndianPhone(registerValues.phone_number),
        },
      }).unwrap();

      setCreatedAccount(values);

      toast.success(
        getApiMessage(response, "Account created. Check your email for OTP."),
        { id: toastId },
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "We could not create your account right now. Please try again.",
        ),
        { id: toastId },
      );
    }
  };

  const verifyEmailOtp: SubmitHandler<OtpValues> = async (values) => {
    if (!createdAccount?.email) return;

    const toastId = toast.loading("Verifying email...");

    try {
      const response = await verifyOtp({
        modelsVerifyOtpRequest: {
          email: createdAccount.email,
          otp: values.otp,
        },
      }).unwrap();

      toast.loading("Starting onboarding...", { id: toastId });

      const loginResponse = await login({
        modelsLoginRequest: {
          email: createdAccount.email,
          password: createdAccount.password,
        } as ModelsLoginRequest,
      }).unwrap();

      const user = loginResponse.data?.user ?? null;
      const route = await completeAuthSession(user);

      setVerifiedEmail(createdAccount.email);

      toast.success(getApiMessage(response, "Email verified successfully."), {
        id: toastId,
        description: route.startsWith("/dashboard/")
          ? "Opening your society workspace."
          : "Redirecting you now.",
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not verify OTP or start your session.",
        ),
        { id: toastId },
      );
    }
  };

  const resendEmailOtp = async () => {
    if (!createdAccount?.email) return;

    const toastId = toast.loading("Resending OTP...");

    try {
      const response = await resendOtp({
        modelsResendOtpRequest: {
          email: createdAccount.email,
        },
      }).unwrap();

      toast.success(getApiMessage(response, "OTP resent."), {
        id: toastId,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not resend OTP."), {
        id: toastId,
      });
    }
  };

  return {
    createdAccount,
    verifiedEmail,

    registerAdmin,
    verifyEmailOtp,
    resendEmailOtp,

    isCreating,
    isSigningIn,
    isVerifying,
    isResending,
  };
}
