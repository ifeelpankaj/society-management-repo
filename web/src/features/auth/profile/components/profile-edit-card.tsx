"use client";

import { Calendar, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/forms/form-field";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  normalizeProfileDateInput,
  PROFILE_GENDER_OPTIONS,
  type ProfileGenderValue,
} from "@/features/auth/profile/profile-utils";
import { usePatchV1AuthProfileMutation } from "@/lib/api/auth-api-extensions";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";

type ProfileEditCardProps = {
  isLoading: boolean;
  user:
    | {
        date_of_birth?: string;
        first_name?: string;
        gender?: string;
        last_name?: string;
        phone_number?: string;
      }
    | null
    | undefined;
};

export function ProfileEditCard({ isLoading, user }: ProfileEditCardProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<ProfileGenderValue | "">("");
  const [dobError, setDobError] = useState<string | null>(null);
  const [patchProfile, { isLoading: isSaving }] = usePatchV1AuthProfileMutation();

  useEffect(() => {
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setPhoneNumber(user?.phone_number ?? "");
    setDateOfBirth(user?.date_of_birth ?? "");
    setGender((user?.gender as ProfileGenderValue | undefined) ?? "");
  }, [user?.date_of_birth, user?.first_name, user?.gender, user?.last_name, user?.phone_number]);

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    const normalizedDob = normalizeProfileDateInput(dateOfBirth);
    if (!normalizedDob.ok) {
      setDobError(normalizedDob.error);
      return;
    }

    setDobError(null);

    const toastId = toast.loading("Saving profile...");

    try {
      const response = await patchProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        date_of_birth: normalizedDob.value || undefined,
        gender: gender || undefined,
      }).unwrap();

      toast.success(getApiMessage(response, "Profile updated."), { id: toastId });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update profile."), { id: toastId });
    }
  };

  return (
    <SectionCard
      title="Edit profile"
      description="Update your name, phone, gender, and date of birth."
      contentClassName="space-y-4"
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : (
        <>
          <FormField
            autoComplete="given-name"
            icon={<User className="size-4" />}
            id="profile-first-name"
            label="First name"
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <FormField
            autoComplete="family-name"
            icon={<User className="size-4" />}
            id="profile-last-name"
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
          <FormField
            autoComplete="tel"
            icon={<Phone className="size-4" />}
            id="profile-phone"
            inputMode="tel"
            label="Phone number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="profile-gender">
              Gender
            </label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              id="profile-gender"
              value={gender}
              onChange={(event) => setGender(event.target.value as ProfileGenderValue | "")}
            >
              <option value="">Select gender</option>
              {PROFILE_GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <FormField
            icon={<Calendar className="size-4" />}
            id="profile-dob"
            label="Date of birth"
            placeholder="YYYY-MM-DD"
            type="date"
            value={dateOfBirth}
            onChange={(event) => {
              setDobError(null);
              setDateOfBirth(event.target.value);
            }}
          />
          {dobError ? <p className="text-sm text-destructive">{dobError}</p> : null}
          <Button disabled={isSaving} type="button" onClick={() => void handleSubmit()}>
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
        </>
      )}
    </SectionCard>
  );
}
