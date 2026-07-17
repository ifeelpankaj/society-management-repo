"use client";

import { useGetStartedFlow } from "../hooks/use-get-started-flow";
import { AccountCreatedSuccess } from "./get-started-success";
import { VerifyOtpStepForm } from "./otp-step-form";
import { RegisterStepForm } from "./register-step-form";

export function GetStartedCard() {
  const {
    createdAccount,
    verifiedEmail,

    registerAdmin,
    verifyEmailOtp,
    resendEmailOtp,

    isCreating,
    isSigningIn,
    isVerifying,
    isResending,
  } = useGetStartedFlow();

  return (
    <div className="w-full">
      {verifiedEmail ? (
        <AccountCreatedSuccess email={verifiedEmail} />
      ) : createdAccount ? (
        <VerifyOtpStepForm
          email={createdAccount.email}
          isVerifying={isVerifying}
          isSigningIn={isSigningIn}
          isResending={isResending}
          onSubmit={verifyEmailOtp}
          onResend={resendEmailOtp}
        />
      ) : (
        <RegisterStepForm isLoading={isCreating} onSubmit={registerAdmin} />
      )}
    </div>
  );
}
