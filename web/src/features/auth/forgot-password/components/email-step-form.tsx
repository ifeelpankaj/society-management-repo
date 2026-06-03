"use client";

import { ArrowRight, Mail } from "lucide-react";
import { type UseFormReturn, useFormState, useWatch } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { FormSection } from "@/components/forms/form-section";
import { SmartForm } from "@/components/forms/smart-form";
import { Button } from "@/components/ui/button";
import { getErrorText, getFieldValidity } from "@/lib/form/form-error";
import { getEmailError, RULES } from "@/lib/validations";
import type { EmailStepFormProps, EmailValues } from "../forgot-password.types";

function EmailFields({ form }: { form: UseFormReturn<EmailValues> }) {
  const email = useWatch({ control: form.control, name: "email" });
  const { errors } = useFormState({ control: form.control });

  return (
    <FormField
      autoComplete="email"
      className="h-10"
      error={getErrorText(errors.email)}
      icon={<Mail className="size-4" />}
      id="email"
      label="Email address"
      placeholder="admin@society.com"
      type="email"
      valid={getFieldValidity(email, getEmailError)}
      {...form.register("email", RULES.email)}
    />
  );
}

export function EmailStepForm({ isLoading, onSubmit }: EmailStepFormProps) {
  return (
    <FormSection
      title="Recover your account"
      description="Enter your registered email address to receive a reset code."
    >
      <SmartForm<EmailValues>
        defaultValues={{ email: "" }}
        formOptions={{ mode: "onChange" }}
        onSubmit={onSubmit}
        actions={
          <Button className="h-11 w-full" disabled={isLoading} type="submit">
            {isLoading ? "Sending OTP..." : "Send OTP"}
            <ArrowRight className="size-4" />
          </Button>
        }
      >
        {(form) => <EmailFields form={form} />}
      </SmartForm>
    </FormSection>
  );
}
