"use client";

import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { type UseFormReturn, useFormState, useWatch } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { SmartForm } from "@/components/forms/smart-form";
import { Button } from "@/components/ui/button";
import { getErrorText, getFieldValidity } from "@/lib/form/form-error";
import { getIdentifierError, RULES } from "@/lib/validations";
import type { LoginFormValues } from "../login.types";

type LoginFormProps = {
  isLoading: boolean;
  onSubmit: (values: LoginFormValues) => void;
};

function LoginFields({ form }: { form: UseFormReturn<LoginFormValues> }) {
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
        id="identifier"
        label="Email or phone"
        placeholder="admin@society.com"
        valid={getFieldValidity(identifier, getIdentifierError)}
        {...form.register("identifier", RULES.identifier)}
      />

      <FormField
        autoComplete="current-password"
        error={getErrorText(errors.password)}
        icon={<LockKeyhole className="size-4" />}
        id="password"
        label="Password"
        placeholder="Enter your password"
        type="password"
        valid={password ? true : null}
        {...form.register("password", RULES.passwordLogin)}
      />
    </>
  );
}

export function LoginForm({ isLoading, onSubmit }: LoginFormProps) {
  return (
    <FormSection
      title="Welcome back"
      description="Sign in with your registered email or phone number to open the right workspace."
      footer={
        <p className="text-center text-muted-foreground text-sm">
          New to Gatezy?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href="/get-started"
          >
            Create your workspace
          </Link>
        </p>
      }
    >
      <SmartForm<LoginFormValues>
        defaultValues={{ identifier: "", password: "" }}
        formOptions={{ mode: "onChange" }}
        onSubmit={onSubmit}
        actions={
          <Button className="h-11 w-full" disabled={isLoading} type="submit">
            {isLoading ? "Signing in..." : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
        }
      >
        {(form) => <LoginFields form={form} />}
      </SmartForm>

      <div className="flex justify-end">
        <Button asChild size="sm" variant="link" className="px-0 text-sm">
          <Link href="/forgot-password">Forgot password?</Link>
        </Button>
      </div>
    </FormSection>
  );
}
