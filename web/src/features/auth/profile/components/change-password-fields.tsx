"use client";

import { KeyRound, LockKeyhole } from "lucide-react";
import { type UseFormReturn, useFormState, useWatch } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { getErrorText, getFieldValidity } from "@/lib/form/form-error";
import {
  getConfirmPasswordError,
  getPasswordError,
  RULES,
} from "@/lib/validations";
import type { ChangePasswordValues } from "../profile.types";

type ChangePasswordFieldsProps = {
  form: UseFormReturn<ChangePasswordValues>;
};

export function ChangePasswordFields({ form }: ChangePasswordFieldsProps) {
  const [currentPassword, newPassword, confirmPassword] = useWatch({
    control: form.control,
    name: ["current_password", "new_password", "confirm_password"],
  });

  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <FormField
        autoComplete="current-password"
        className="h-10"
        error={getErrorText(errors.current_password)}
        icon={<LockKeyhole className="size-4" />}
        id="current-password"
        label="Current password"
        placeholder="Enter current password"
        type="password"
        valid={currentPassword ? currentPassword.length >= 8 : null}
        {...form.register("current_password", RULES.passwordLogin)}
      />

      <FormField
        autoComplete="new-password"
        className="h-10"
        error={getErrorText(errors.new_password)}
        hint="Use uppercase, lowercase, number, and special character."
        icon={<KeyRound className="size-4" />}
        id="new-password"
        label="New password"
        placeholder="Minimum 8 characters"
        type="password"
        valid={getFieldValidity(newPassword, getPasswordError)}
        {...form.register("new_password", RULES.passwordStrong)}
      />

      <FormField
        autoComplete="new-password"
        className="h-10"
        error={getErrorText(errors.confirm_password)}
        icon={<KeyRound className="size-4" />}
        id="confirm-password"
        label="Confirm password"
        placeholder="Repeat new password"
        type="password"
        valid={
          confirmPassword
            ? getConfirmPasswordError(confirmPassword, newPassword) === null
            : null
        }
        {...form.register(
          "confirm_password",
          RULES.confirmPassword(newPassword),
        )}
      />
    </>
  );
}
