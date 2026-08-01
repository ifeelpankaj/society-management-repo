import { useCallback, useEffect, useRef, useState } from "react";

import { getApiMessage } from "@/features/auth/api-error";
import type { GuardCheckInInput } from "@/features/guard/guard-routes";
import {
  type ModelsVisitorEntry,
  usePostV1PublicVisitorEntriesQrValidateMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesCheckInMutation,
} from "@/lib/api/generated-api";

export type GuardCheckInErrorKind =
  | "invalid_params"
  | "validation_failed"
  | "not_approved"
  | "already_checked_in"
  | "expired"
  | "network"
  | "unknown";

export type GuardCheckInError = {
  kind: GuardCheckInErrorKind;
  message: string;
};

function mapCheckInError(error: unknown): GuardCheckInError {
  const message = getApiMessage(error, "Please try again.");

  if (/already checked in/i.test(message)) {
    return { kind: "already_checked_in", message };
  }

  if (/expired/i.test(message)) {
    return { kind: "expired", message };
  }

  if (/not approved|waiting approval/i.test(message)) {
    return { kind: "not_approved", message };
  }

  return { kind: "unknown", message };
}

export interface UseGuardCheckInResult {
  entry: ModelsVisitorEntry | null;
  isLoadingEntry: boolean;
  entryError: GuardCheckInError | null;
  canCheckIn: boolean;
  disabledReason?: string;
  checkIn: () => Promise<void>;
  isCheckingIn: boolean;
  isCheckedIn: boolean;
}

export function useGuardCheckIn(
  input: GuardCheckInInput | null,
  societyId: number | undefined,
): UseGuardCheckInResult {
  const [entry, setEntry] = useState<ModelsVisitorEntry | null>(null);
  const [entryError, setEntryError] = useState<GuardCheckInError | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const checkInSubmittedRef = useRef(false);
  const qrToken = input?.token;

  const [validateQr, validateQrState] = usePostV1PublicVisitorEntriesQrValidateMutation();
  const [checkInMutation, checkInState] = usePostV1SocietiesBySocietyIdVisitorEntriesCheckInMutation();

  useEffect(() => {
    checkInSubmittedRef.current = false;
    setEntry(null);
    setEntryError(null);
    setIsCheckedIn(false);

    if (!qrToken || !societyId) {
      if (!qrToken) {
        setEntryError({
          kind: "invalid_params",
          message: "This check-in link is invalid or incomplete.",
        });
      }
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await validateQr({
          modelsQrTokenRequest: { token: qrToken },
        }).unwrap();

        if (cancelled) {
          return;
        }

        const validatedEntry = response.data?.entry ?? null;
        setEntry(validatedEntry);

        if (validatedEntry?.status === "checked_in") {
          setIsCheckedIn(true);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setEntryError({
          kind: "validation_failed",
          message: getApiMessage(error, "This QR cannot be used for entry."),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qrToken, societyId, validateQr]);

  const canCheckIn =
    Boolean(entry?.status === "approved") &&
    !isCheckedIn &&
    !checkInState.isLoading &&
    !validateQrState.isLoading;

  const disabledReason = (() => {
    if (!entry) {
      return undefined;
    }

    if (entry.status === "checked_in" || isCheckedIn) {
      return "Visitor is already checked in.";
    }

    if (entry.status !== "approved") {
      return "This visitor is not approved for check-in yet.";
    }

    return undefined;
  })();

  const checkIn = useCallback(async () => {
    if (!qrToken || !societyId || !canCheckIn || checkInSubmittedRef.current) {
      return;
    }

    checkInSubmittedRef.current = true;

    try {
      const response = await checkInMutation({
        societyId,
        modelsQrTokenRequest: { token: qrToken },
      }).unwrap();

      setEntry(response.data?.entry ?? entry);
      setIsCheckedIn(true);
      setEntryError(null);
    } catch (error) {
      checkInSubmittedRef.current = false;
      setEntryError(mapCheckInError(error));
    }
  }, [canCheckIn, checkInMutation, entry, qrToken, societyId]);

  return {
    entry,
    isLoadingEntry: validateQrState.isLoading,
    entryError,
    canCheckIn,
    disabledReason,
    checkIn,
    isCheckingIn: checkInState.isLoading,
    isCheckedIn,
  };
}
