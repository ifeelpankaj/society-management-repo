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

import type { VisitorInviteStatusView } from "./visitor-invite-status";
import {
  buildCompanionDetails,
  MAX_VISITOR_COMPANIONS,
  normalizeCompanionNames,
  parseCompanionsCount,
  toIsoFromDatetimeLocal,
} from "./visitor-invite-utils";

type VisitorInviteFormValues = {
  expectedAt: string;
  expectedCheckoutAt: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  vehicleNumber: string;
  notes: string;
  companionsCount: string;
  companionNames: string[];
};

type SubmitResult = {
  entry?: ModelsVisitorEntry;
  qr?: ModelsQrTokenResponse;
};

export type VisitorInvitePageView = "form" | "qr" | VisitorInviteStatusView;

export function useVisitorInvitePage(token: string) {
  const normalizedToken = decodeURIComponent(token).trim();
  const [showOptional, setShowOptional] = useState(false);
  const [form, setForm] = useState<VisitorInviteFormValues>({
    expectedAt: "",
    expectedCheckoutAt: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    vehicleNumber: "",
    notes: "",
    companionsCount: "",
    companionNames: [],
  });
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const inviteQuery = useGetV1PublicVisitorInvitesByTokenQuery(
    { token: normalizedToken },
    { skip: !normalizedToken },
  );

  const [submitInvite, submitState] =
    usePostV1PublicVisitorInvitesByTokenSubmitMutation();

  const pageData = inviteQuery.data?.data;
  const invite = pageData?.invite ?? null;
  const pageView = pageData?.view as VisitorInvitePageView | undefined;

  const recoveredResult = useMemo(() => {
    if (pageView !== "qr") {
      return null;
    }

    return {
      entry: pageData?.entry,
      qr: pageData?.qr,
    };
  }, [pageData?.entry, pageData?.qr, pageView]);

  const displayResult = submitResult ?? recoveredResult;

  const parsedCompanionsCount = useMemo(
    () => parseCompanionsCount(form.companionsCount),
    [form.companionsCount],
  );

  const validationError = useMemo(() => {
    if (!form.fullName.trim()) {
      return "Enter your full name";
    }

    if (!form.expectedAt.trim()) {
      return "Select your expected check-in time";
    }

    if (!toIsoFromDatetimeLocal(form.expectedAt)) {
      return "Enter a valid expected check-in time";
    }

    if (form.expectedCheckoutAt.trim() && !toIsoFromDatetimeLocal(form.expectedCheckoutAt)) {
      return "Enter a valid expected checkout time";
    }

    const phone = form.phoneNumber.trim();
    const email = form.email.trim();

    if (!phone && !email) {
      return "Enter your phone number or email";
    }

    if (phone && !isIndianPhone(phone)) {
      return "Enter a valid 10-digit phone number";
    }

    if (parsedCompanionsCount === null) {
      return `Enter companion count (0–${MAX_VISITOR_COMPANIONS})`;
    }

    return null;
  }, [
    form.email,
    form.expectedAt,
    form.expectedCheckoutAt,
    form.fullName,
    form.phoneNumber,
    parsedCompanionsCount,
  ]);

  const updateField = <K extends keyof VisitorInviteFormValues>(
    key: K,
    value: VisitorInviteFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateCompanionsCount = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 2);
    const count = parseCompanionsCount(sanitized) ?? 0;

    setForm((current) => ({
      ...current,
      companionsCount: sanitized,
      companionNames: normalizeCompanionNames(current.companionNames, count),
    }));
  };

  const updateCompanionName = (index: number, value: string) => {
    setForm((current) => {
      const next = [...current.companionNames];
      next[index] = value;
      return { ...current, companionNames: next };
    });
  };

  const handleSubmit = async () => {
    if (validationError || parsedCompanionsCount === null) {
      toast.error(validationError ?? "Enter companion count");
      return;
    }

    const toastId = toast.loading("Submitting visitor details...");
    const companionDetails = buildCompanionDetails(
      form.companionNames,
      parsedCompanionsCount,
    );

    try {
      const response = await submitInvite({
        token: normalizedToken,
        modelsVisitorFormRequest: {
          full_name: form.fullName.trim(),
          phone_number: form.phoneNumber.trim() || undefined,
          email: form.email.trim() || undefined,
          vehicle_number: form.vehicleNumber.trim() || undefined,
          notes: form.notes.trim() || undefined,
          companions_count: parsedCompanionsCount,
          companion_details:
            companionDetails.length > 0 ? companionDetails : undefined,
          expected_at: toIsoFromDatetimeLocal(form.expectedAt),
          expected_checkout_at: toIsoFromDatetimeLocal(form.expectedCheckoutAt),
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
    displayResult,
    form,
    handleSubmit,
    invite,
    inviteQuery,
    pageData,
    pageView,
    parsedCompanionsCount,
    showOptional,
    setShowOptional,
    submitResult,
    submitState,
    updateCompanionName,
    updateCompanionsCount,
    updateField,
    validationError,
  };
}
