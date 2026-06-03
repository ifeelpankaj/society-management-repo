"use client";

import { ArrowRight, LockKeyhole, Mail, Phone, User } from "lucide-react";
import { type UseFormReturn, useFormState, useWatch } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { SmartForm } from "@/components/forms/smart-form";
import { Button } from "@/components/ui/button";
import { getErrorText, getFieldValidity } from "@/lib/form/form-error";
import {
  getConfirmPasswordError,
  getEmailError,
  getNameError,
  getPasswordError,
  getPhoneError,
  RULES,
} from "@/lib/validations";
import type {
  GetStartedFormValues,
  RegisterStepFormProps,
} from "../get-started.types";

function RegisterFields({
  form,
}: {
  form: UseFormReturn<GetStartedFormValues>;
}) {
  const [firstName, lastName, email, phone, password, confirmPassword] =
    useWatch({
      control: form.control,
      name: [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "password",
        "confirmPassword",
      ],
    });

  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          className="h-10"
          error={getErrorText(errors.first_name)}
          icon={<User className="size-4" />}
          id="first-name"
          label="First name"
          placeholder="Jay"
          valid={getFieldValidity(firstName, getNameError)}
          {...form.register("first_name", RULES.name)}
        />

        <FormField
          autoComplete="family-name"
          className="h-10"
          error={getErrorText(errors.last_name)}
          icon={<User className="size-4" />}
          id="last-name"
          label="Last name"
          placeholder="Sharma"
          valid={lastName ? getNameError(lastName) === null : null}
          {...form.register("last_name", RULES.optionalName)}
        />
      </div>

      <FormField
        autoComplete="email"
        className="h-10"
        error={getErrorText(errors.email)}
        icon={<Mail className="size-4" />}
        id="email"
        label="Work email"
        placeholder="admin@society.com"
        type="email"
        valid={getFieldValidity(email, getEmailError)}
        {...form.register("email", RULES.email)}
      />

      <FormField
        autoComplete="tel"
        className="h-10"
        error={getErrorText(errors.phone_number)}
        hint="Use your 10-digit Indian mobile number."
        icon={<Phone className="size-4" />}
        id="phone-number"
        label="Phone number"
        placeholder="9876543210"
        valid={getFieldValidity(phone, getPhoneError)}
        {...form.register("phone_number", RULES.phone)}
      />

      <FormField
        autoComplete="new-password"
        className="h-10"
        error={getErrorText(errors.password)}
        hint="Use uppercase, lowercase, number, and special character."
        icon={<LockKeyhole className="size-4" />}
        id="password"
        label="Password"
        placeholder="Minimum 8 characters"
        type="password"
        valid={getFieldValidity(password, getPasswordError)}
        {...form.register("password", RULES.passwordStrong)}
      />

      <FormField
        autoComplete="new-password"
        className="h-10"
        error={getErrorText(errors.confirmPassword)}
        icon={<LockKeyhole className="size-4" />}
        id="confirm-password"
        label="Confirm password"
        placeholder="Repeat your password"
        type="password"
        valid={
          confirmPassword
            ? getConfirmPasswordError(confirmPassword, password) === null
            : null
        }
        {...form.register("confirmPassword", RULES.confirmPassword(password))}
      />
    </>
  );
}

export function RegisterStepForm({
  isLoading,
  onSubmit,
}: RegisterStepFormProps) {
  return (
    <FormSection
      title="Create admin account"
      description="Create the owner account that will complete setup and invite the operating team."
      footer={
        <p className="text-center text-muted-foreground text-sm">
          By continuing, you can complete society setup after login.
        </p>
      }
    >
      <SmartForm<GetStartedFormValues>
        defaultValues={{
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          password: "",
          confirmPassword: "",
        }}
        formOptions={{ mode: "onChange" }}
        onSubmit={onSubmit}
        actions={
          <Button className="h-11 w-full" disabled={isLoading} type="submit">
            {isLoading ? "Creating account..." : "Create workspace"}
            <ArrowRight className="size-4" />
          </Button>
        }
      >
        {(form) => <RegisterFields form={form} />}
      </SmartForm>
    </FormSection>
  );
}
