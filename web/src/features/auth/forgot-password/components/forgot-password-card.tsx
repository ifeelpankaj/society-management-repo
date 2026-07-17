"use client";

import { useForgotPasswordFlow } from "../hooks/use-forgot-password-flow";
import { EmailStepForm } from "./email-step-form";
import { ResetStepForm } from "./reset-step-form";
import { ResetSuccess } from "./reset-success";

export function ForgotPasswordCard() {
  const {
    step,
    email,
    sendOtp,
    submitReset,
    handleResend,
    isSendingOtp,
    isResetting,
    isResending,
  } = useForgotPasswordFlow();

  return (
    <div className="w-full">
      {step === "email" ? (
        <EmailStepForm isLoading={isSendingOtp} onSubmit={sendOtp} />
      ) : null}

      {step === "reset" ? (
        <ResetStepForm
          email={email}
          isResetting={isResetting}
          isResending={isResending}
          onSubmit={submitReset}
          onResend={handleResend}
        />
      ) : null}

      {step === "done" ? <ResetSuccess /> : null}
    </div>
  );
}
