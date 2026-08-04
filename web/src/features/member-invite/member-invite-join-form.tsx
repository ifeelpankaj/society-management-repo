"use client";

import { useState } from "react";
import { LockKeyhole, LogIn, Mail, User, UserPlus } from "lucide-react";
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
  RULES,
} from "@/lib/validations";

export type MemberInviteLoginFormValues = {
  identifier: string;
  password: string;
};

export type MemberInviteRegisterFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

type MemberInviteJoinFormProps = {
  defaultEmail?: string;
  defaultFirstName?: string;
  defaultLastName?: string;
  isLoading?: boolean;
  onLogin: (values: MemberInviteLoginFormValues) => void;
  onRegister: (values: MemberInviteRegisterFormValues) => void;
};

function RegisterFields({
  form,
  readOnlyEmail,
}: {
  form: UseFormReturn<MemberInviteRegisterFormValues>;
  readOnlyEmail?: boolean;
}) {
  const [firstName, lastName, email, password] = useWatch({
    control: form.control,
    name: ["first_name", "last_name", "email", "password"],
  });
  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          error={getErrorText(errors.first_name)}
          icon={<User className="size-4" />}
          id="member-invite-first-name"
          label="First name"
          placeholder="Jay"
          valid={getFieldValidity(firstName, getNameError)}
          {...form.register("first_name", RULES.name)}
        />
        <FormField
          autoComplete="family-name"
          error={getErrorText(errors.last_name)}
          icon={<User className="size-4" />}
          id="member-invite-last-name"
          label="Last name"
          placeholder="Sharma"
          valid={lastName ? getNameError(lastName) === null : null}
          {...form.register("last_name", RULES.optionalName)}
        />
      </div>
      <FormField
        autoComplete="email"
        disabled={readOnlyEmail}
        error={getErrorText(errors.email)}
        icon={<Mail className="size-4" />}
        id="member-invite-email"
        label="Email"
        placeholder="you@example.com"
        type="email"
        valid={getFieldValidity(email, getEmailError)}
        {...form.register("email", RULES.email)}
      />
      <FormField
        autoComplete="new-password"
        error={getErrorText(errors.password)}
        hint="Use uppercase, lowercase, number, and special character."
        icon={<LockKeyhole className="size-4" />}
        id="member-invite-password"
        label="Password"
        placeholder="Minimum 8 characters"
        type="password"
        valid={getFieldValidity(password, getPasswordError)}
        {...form.register("password", RULES.passwordStrong)}
      />
    </>
  );
}

function LoginFields({ form }: { form: UseFormReturn<MemberInviteLoginFormValues> }) {
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
        id="member-invite-login-identifier"
        label="Email or phone"
        placeholder="you@example.com"
        valid={getFieldValidity(identifier, getIdentifierError)}
        {...form.register("identifier", RULES.identifier)}
      />
      <FormField
        autoComplete="current-password"
        error={getErrorText(errors.password)}
        icon={<LockKeyhole className="size-4" />}
        id="member-invite-login-password"
        label="Password"
        placeholder="Enter your password"
        type="password"
        valid={password ? true : null}
        {...form.register("password", RULES.passwordLogin)}
      />
    </>
  );
}

export function MemberInviteJoinForm({
  defaultEmail = "",
  defaultFirstName = "",
  defaultLastName = "",
  isLoading = false,
  onLogin,
  onRegister,
}: MemberInviteJoinFormProps) {
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setAuthMode("register")}
          type="button"
          variant={authMode === "register" ? "default" : "outline"}
        >
          Create account
        </Button>
        <Button
          onClick={() => setAuthMode("login")}
          type="button"
          variant={authMode === "login" ? "default" : "outline"}
        >
          Already have account
        </Button>
      </div>

      {authMode === "register" ? (
        <SmartForm<MemberInviteRegisterFormValues>
          key={`register-${defaultEmail}-${defaultFirstName}`}
          contentClassName="space-y-3"
          defaultValues={{
            first_name: defaultFirstName,
            last_name: defaultLastName,
            email: defaultEmail,
            password: "",
          }}
          formOptions={{ mode: "onChange" }}
          onSubmit={onRegister}
          actions={
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "Joining flat..." : "Create account and join"}
              <UserPlus className="size-4" />
            </Button>
          }
        >
          {(form) => (
            <RegisterFields form={form} readOnlyEmail={Boolean(defaultEmail)} />
          )}
        </SmartForm>
      ) : (
        <SmartForm<MemberInviteLoginFormValues>
          contentClassName="space-y-3"
          defaultValues={{ identifier: defaultEmail, password: "" }}
          formOptions={{ mode: "onChange" }}
          onSubmit={onLogin}
          actions={
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "Signing in..." : "Login and join"}
              <LogIn className="size-4" />
            </Button>
          }
        >
          {(form) => <LoginFields form={form} />}
        </SmartForm>
      )}
    </div>
  );
}
