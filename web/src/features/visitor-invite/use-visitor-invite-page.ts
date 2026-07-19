"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  type ModelsQrTokenResponse,
  type ModelsVisitorEntry,
  useGetV1PublicVisitorInvitesByTokenQuery,
  usePostV1PublicVisitorInvitesByTokenSubmitMutation,
} from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { isIndianPhone } from "@/lib/validations";

type VisitorInviteFormValues = {
  fullName: string;
  phoneNumber: string;
  email: string;
  vehicleNumber: string;
  notes: string;
};

type SubmitResult = {
  entry?: ModelsVisitorEntry;
  qr?: ModelsQrTokenResponse;
};

export function useVisitorInvitePage(token: string) {
  const normalizedToken = decodeURIComponent(token).trim();
  const [showOptional, setShowOptional] = useState(false);
  const [form, setForm] = useState<VisitorInviteFormValues>({
    fullName: "",
    phoneNumber: "",
    email: "",
    vehicleNumber: "",
    notes: "",
  });
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const inviteQuery = useGetV1PublicVisitorInvitesByTokenQuery(
    { token: normalizedToken },
    { skip: !normalizedToken },
  );

  const [submitInvite, submitState] =
    usePostV1PublicVisitorInvitesByTokenSubmitMutation();

  const invite = inviteQuery.data?.data?.invite ?? null;

  const validationError = useMemo(() => {
    if (!form.fullName.trim()) {
      return "Enter your full name";
    }

    const phone = form.phoneNumber.trim();
    const email = form.email.trim();

    if (!phone && !email) {
      return "Enter your phone number or email";
    }

    if (phone && !isIndianPhone(phone)) {
      return "Enter a valid 10-digit phone number";
    }

    return null;
  }, [form.email, form.fullName, form.phoneNumber]);

  const updateField = <K extends keyof VisitorInviteFormValues>(
    key: K,
    value: VisitorInviteFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const toastId = toast.loading("Submitting visitor details...");

    try {
      const response = await submitInvite({
        token: normalizedToken,
        modelsVisitorFormRequest: {
          full_name: form.fullName.trim(),
          phone_number: form.phoneNumber.trim() || undefined,
          email: form.email.trim() || undefined,
          vehicle_number: form.vehicleNumber.trim() || undefined,
          notes: form.notes.trim() || undefined,
        },
      }).unwrap();

      setSubmitResult({
        entry: response.data?.entry,
        qr: response.data?.qr,
      });

      toast.success(getApiMessage(response, "Entry details submitted."), {
        id: toastId,
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not submit visitor details."),
        { id: toastId },
      );
    }
  };

  return {
    form,
    handleSubmit,
    invite,
    inviteQuery,
    showOptional,
    setShowOptional,
    submitResult,
    submitState,
    updateField,
    validationError,
  };
}
