"use client";

import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import {
  usePostV1AuthForgotPasswordMutation,
  usePostV1AuthResendOtpMutation,
  usePostV1AuthResetPasswordMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

import type {
  EmailValues,
  ForgotStep,
  ResetValues,
} from "../forgot-password.types";

export function useForgotPasswordFlow() {
  const [step, setStep] = useState<ForgotStep>("email");
  const [email, setEmail] = useState("");

  const [forgotPassword, { isLoading: isSendingOtp }] =
    usePostV1AuthForgotPasswordMutation();

  const [resetPassword, { isLoading: isResetting }] =
    usePostV1AuthResetPasswordMutation();

  const [resendOtp, { isLoading: isResending }] =
    usePostV1AuthResendOtpMutation();

  const sendOtp: SubmitHandler<EmailValues> = async (values) => {
    const toastId = toast.loading("Sending OTP...");

    try {
      const response = await forgotPassword({
        modelsForgotPasswordRequest: values,
      }).unwrap();

      setEmail(values.email);
      setStep("reset");

      toast.success(getApiMessage(response, "OTP sent to your email."), {
        id: toastId,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send OTP."), {
        id: toastId,
      });
    }
  };

  const submitReset: SubmitHandler<ResetValues> = async (values) => {
    const toastId = toast.loading("Resetting password...");

    try {
      const response = await resetPassword({
        modelsResetPasswordRequest: {
          email,
          otp: values.otp,
          new_password: values.new_password,
          confirm_password: values.confirm_password,
        },
      }).unwrap();

      setStep("done");

      toast.success(getApiMessage(response, "Password reset successfully."), {
        id: toastId,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not reset password."), {
        id: toastId,
      });
    }
  };

  const handleResend = async () => {
    if (!email) return;

    const toastId = toast.loading("Resending OTP...");

    try {
      const response = await resendOtp({
        modelsResendOtpRequest: { email },
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
    step,
    email,
    sendOtp,
    submitReset,
    handleResend,
    isSendingOtp,
    isResetting,
    isResending,
  };
}
