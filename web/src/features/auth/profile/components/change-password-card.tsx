"use client";

import { SmartForm } from "@/components/forms/smart-form";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";

import type { ChangePasswordValues } from "../profile.types";
import { ChangePasswordFields } from "./change-password-fields";

type ChangePasswordCardProps = {
  isChangingPassword: boolean;
  onSubmit: (values: ChangePasswordValues) => void;
};

export function ChangePasswordCard({
  isChangingPassword,
  onSubmit,
}: ChangePasswordCardProps) {
  return (
    <SectionCard
      title="Change password"
      description="Use a strong password to keep your account protected."
    >
      <SmartForm<ChangePasswordValues>
        defaultValues={{
          current_password: "",
          new_password: "",
          confirm_password: "",
        }}
        formOptions={{ mode: "onChange" }}
        onSubmit={onSubmit}
        actions={
          <Button
            className="w-full"
            disabled={isChangingPassword}
            type="submit"
          >
            {isChangingPassword ? "Updating..." : "Update password"}
          </Button>
        }
      >
        {(form) => <ChangePasswordFields form={form} />}
      </SmartForm>
    </SectionCard>
  );
}
