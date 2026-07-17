"use client";

import { ArrowRight, KeyRound, LockKeyhole } from "lucide-react";
import { type UseFormReturn, useFormState, useWatch } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { SmartForm } from "@/components/forms/smart-form";
import { Button } from "@/components/ui/button";
import { getErrorText, getFieldValidity } from "@/lib/form/form-error";
import {
  getConfirmPasswordError,
  getOtpError,
  getPasswordError,
  RULES,
} from "@/lib/validations";
import type { ResetStepFormProps, ResetValues } from "../forgot-password.types";

function ResetFields({ form }: { form: UseFormReturn<ResetValues> }) {
  const [otp, password, confirmPassword] = useWatch({
    control: form.control,
    name: ["otp", "new_password", "confirm_password"],
  });

  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <FormField
        autoComplete="one-time-code"
        className="h-10"
        error={getErrorText(errors.otp)}
        hint="Enter the OTP sent to your email."
        icon={<KeyRound className="size-4" />}
        id="otp"
        label="OTP"
        placeholder="6-digit code"
        valid={getFieldValidity(otp, (value) => getOtpError(value, 6))}
        {...form.register("otp", RULES.otp(6))}
      />

      <FormField
        autoComplete="new-password"
        className="h-10"
        error={getErrorText(errors.new_password)}
        hint="Use uppercase, lowercase, number, and special character."
        icon={<LockKeyhole className="size-4" />}
        id="new-password"
        label="New password"
        placeholder="Minimum 8 characters"
        type="password"
        valid={getFieldValidity(password, getPasswordError)}
        {...form.register("new_password", RULES.passwordStrong)}
      />

      <FormField
        autoComplete="new-password"
        className="h-10"
        error={getErrorText(errors.confirm_password)}
        icon={<LockKeyhole className="size-4" />}
        id="confirm-password"
        label="Confirm password"
        placeholder="Repeat your new password"
        type="password"
        valid={
          confirmPassword
            ? getConfirmPasswordError(confirmPassword, password) === null
            : null
        }
        {...form.register("confirm_password", RULES.confirmPassword(password))}
      />
    </>
  );
}

export function ResetStepForm({
  email,
  isResetting,
  isResending,
  onSubmit,
  onResend,
}: ResetStepFormProps) {
  return (
    <FormSection
      title="Set new password"
      description={`Enter the OTP sent to ${email} and choose a strong password.`}
      footer={
        <Button
          disabled={isResending}
          onClick={onResend}
          type="button"
          variant="link"
          className="w-full text-sm"
        >
          {isResending ? "Resending..." : "Resend OTP"}
        </Button>
      }
    >
      <SmartForm<ResetValues>
        defaultValues={{
          otp: "",
          new_password: "",
          confirm_password: "",
        }}
        formOptions={{ mode: "onChange" }}
        onSubmit={onSubmit}
        actions={
          <Button className="h-11 w-full" disabled={isResetting} type="submit">
            {isResetting ? "Resetting..." : "Reset password"}
            <ArrowRight className="size-4" />
          </Button>
        }
      >
        {(form) => <ResetFields form={form} />}
      </SmartForm>
    </FormSection>
  );
}
