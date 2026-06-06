"use client";

import { LockKeyhole, LogIn, Mail, Phone, User, UserPlus } from "lucide-react";
import { type UseFormReturn, useFormState, useWatch } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { SmartForm } from "@/components/forms/smart-form";
import { Button } from "@/components/ui/button";
import { getErrorText, getFieldValidity } from "@/lib/form/form-error";
import {
  getEmailError,
  getIdentifierError,
  getNameError,
  getPasswordError,
  getPhoneError,
  RULES,
} from "@/lib/validations";

export type ClaimLoginFormValues = {
  identifier: string;
  password: string;
};

export type ClaimRegisterFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
};

type ClaimLoginFormProps = {
  isLoading: boolean;
  onSubmit: (values: ClaimLoginFormValues) => void;
};

type ClaimRegisterFormProps = {
  isLoading: boolean;
  onSubmit: (values: ClaimRegisterFormValues) => void;
};

function ClaimLoginFields({
  form,
}: {
  form: UseFormReturn<ClaimLoginFormValues>;
}) {
  const [identifier, password] = useWatch({
    control: form.control,
    name: ["identifier", "password"],
  });
  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <FormField
        autoComplete="username"
        error={getErrorText(errors.identifier)}
        hint="Use your email or 10-digit Indian phone number."
        icon={<Mail className="size-4" />}
        id="claim-login-identifier"
        label="Email or phone"
        placeholder="you@example.com"
        valid={getFieldValidity(identifier, getIdentifierError)}
        {...form.register("identifier", RULES.identifier)}
      />
      <FormField
        autoComplete="current-password"
        error={getErrorText(errors.password)}
        icon={<LockKeyhole className="size-4" />}
        id="claim-login-password"
        label="Password"
        placeholder="Enter your password"
        type="password"
        valid={password ? true : null}
        {...form.register("password", RULES.passwordLogin)}
      />
    </>
  );
}

function ClaimRegisterFields({
  form,
}: {
  form: UseFormReturn<ClaimRegisterFormValues>;
}) {
  const [firstName, lastName, email, phone, password] = useWatch({
    control: form.control,
    name: ["first_name", "last_name", "email", "phone_number", "password"],
  });
  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          error={getErrorText(errors.first_name)}
          icon={<User className="size-4" />}
          id="claim-register-first-name"
          label="First name"
          placeholder="Jay"
          valid={getFieldValidity(firstName, getNameError)}
          {...form.register("first_name", RULES.name)}
        />
        <FormField
          autoComplete="family-name"
          error={getErrorText(errors.last_name)}
          icon={<User className="size-4" />}
          id="claim-register-last-name"
          label="Last name"
          placeholder="Sharma"
          valid={lastName ? getNameError(lastName) === null : null}
          {...form.register("last_name", RULES.optionalName)}
        />
      </div>
      <FormField
        autoComplete="email"
        error={getErrorText(errors.email)}
        icon={<Mail className="size-4" />}
        id="claim-register-email"
        label="Email"
        placeholder="you@example.com"
        type="email"
        valid={getFieldValidity(email, getEmailError)}
        {...form.register("email", RULES.email)}
      />
      <FormField
        autoComplete="tel"
        error={getErrorText(errors.phone_number)}
        hint="Use your 10-digit Indian mobile number."
        icon={<Phone className="size-4" />}
        id="claim-register-phone"
        label="Phone"
        placeholder="9876543210"
        valid={getFieldValidity(phone, getPhoneError)}
        {...form.register("phone_number", RULES.phone)}
      />
      <FormField
        autoComplete="new-password"
        error={getErrorText(errors.password)}
        hint="Use uppercase, lowercase, number, and special character."
        icon={<LockKeyhole className="size-4" />}
        id="claim-register-password"
        label="Password"
        placeholder="Minimum 8 characters"
        type="password"
        valid={getFieldValidity(password, getPasswordError)}
        {...form.register("password", RULES.passwordStrong)}
      />
    </>
  );
}

export function ClaimLoginForm({ isLoading, onSubmit }: ClaimLoginFormProps) {
  return (
    <SmartForm<ClaimLoginFormValues>
      contentClassName="space-y-3"
      defaultValues={{ identifier: "", password: "" }}
      formOptions={{ mode: "onChange" }}
      onSubmit={onSubmit}
      actions={
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Signing in..." : "Login"}
          <LogIn className="size-4" />
        </Button>
      }
    >
      {(form) => <ClaimLoginFields form={form} />}
    </SmartForm>
  );
}

export function ClaimRegisterForm({
  isLoading,
  onSubmit,
}: ClaimRegisterFormProps) {
  return (
    <SmartForm<ClaimRegisterFormValues>
      contentClassName="space-y-3"
      defaultValues={{
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
      }}
      formOptions={{ mode: "onChange" }}
      onSubmit={onSubmit}
      actions={
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Creating account..." : "Register"}
          <UserPlus className="size-4" />
        </Button>
      }
    >
      {(form) => <ClaimRegisterFields form={form} />}
    </SmartForm>
  );
}
