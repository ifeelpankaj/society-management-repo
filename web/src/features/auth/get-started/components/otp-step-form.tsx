"use client";

import { ArrowRight, KeyRound } from "lucide-react";
import { type UseFormReturn, useFormState, useWatch } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { SmartForm } from "@/components/forms/smart-form";
import { Button } from "@/components/ui/button";
import { getErrorText, getFieldValidity } from "@/lib/form/form-error";
import { getOtpError, RULES } from "@/lib/validations";
import type { OtpValues, VerifyOtpStepFormProps } from "../get-started.types";

function OtpFields({ form }: { form: UseFormReturn<OtpValues> }) {
  const otp = useWatch({ control: form.control, name: "otp" });
  const { errors } = useFormState({ control: form.control });

  return (
    <FormField
      autoComplete="one-time-code"
      className="h-10"
      error={getErrorText(errors.otp)}
      hint="Enter the OTP sent to your email address."
      icon={<KeyRound className="size-4" />}
      id="otp"
      label="Email OTP"
      placeholder="6-digit code"
      valid={getFieldValidity(otp, (value) => getOtpError(value, 6))}
      {...form.register("otp", RULES.otp(6))}
    />
  );
}

export function VerifyOtpStepForm({
  email,
  isVerifying,
  isSigningIn,
  isResending,
  onSubmit,
  onResend,
}: VerifyOtpStepFormProps) {
  return (
    <FormSection
      title="Verify your email"
      description={`Enter the OTP sent to ${email}. After verification, we will start your session and open onboarding.`}
      footer={
        <Button
          className="w-full text-sm"
          disabled={isResending}
          onClick={onResend}
          type="button"
          variant="link"
        >
          {isResending ? "Resending..." : "Resend OTP"}
        </Button>
      }
    >
      <SmartForm<OtpValues>
        defaultValues={{ otp: "" }}
        formOptions={{ mode: "onChange" }}
        onSubmit={onSubmit}
        actions={
          <Button
            className="h-11 w-full"
            disabled={isVerifying || isSigningIn}
            type="submit"
          >
            {isSigningIn
              ? "Starting onboarding..."
              : isVerifying
                ? "Verifying..."
                : "Verify email"}
            <ArrowRight className="size-4" />
          </Button>
        }
      >
        {(form) => <OtpFields form={form} />}
      </SmartForm>
    </FormSection>
  );
}
