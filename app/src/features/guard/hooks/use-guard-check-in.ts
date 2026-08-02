import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getApiErrorCode, getApiMessage } from "@/features/auth/api-error";
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

export type GuardScanOutcome =
  | "loading"
  | "ready"
  | "already_inside"
  | "just_checked_in"
  | "pending_approval"
  | "blocked"
  | "error";

export type GuardCheckInError = {
  kind: GuardCheckInErrorKind;
  message: string;
  redirectToWaitingAtGate?: boolean;
};

const ALREADY_CHECKED_IN_MESSAGE = "This visitor is already checked in.";
const NOT_APPROVED_MESSAGE =
  "This visitor is not approved for check-in yet. Check pending approvals.";

function mapValidateError(error: unknown): GuardCheckInError {
  const code = getApiErrorCode(error);
  const message = getApiMessage(error, "This QR cannot be used for entry.");

  if (code === "VISITOR_ALREADY_CHECKED_IN") {
    return { kind: "already_checked_in", message: ALREADY_CHECKED_IN_MESSAGE };
  }

  if (code === "VISITOR_QR_INVALID") {
    return {
      kind: "validation_failed",
      message: "QR not recognized. Opening Waiting at Gate...",
      redirectToWaitingAtGate: true,
    };
  }

  if (code === "VISITOR_QR_EXPIRED") {
    return {
      kind: "expired",
      message: "This QR has expired. Opening Waiting at Gate...",
      redirectToWaitingAtGate: true,
    };
  }

  if (code === "VISITOR_INVALID_STATE") {
    if (/waiting approval|not approved/i.test(message)) {
      return { kind: "not_approved", message: NOT_APPROVED_MESSAGE };
    }
    return { kind: "not_approved", message };
  }

  if (/already checked in/i.test(message)) {
    return { kind: "already_checked_in", message: ALREADY_CHECKED_IN_MESSAGE };
  }

  if (/expired/i.test(message)) {
    return {
      kind: "expired",
      message: "This QR has expired. Opening Waiting at Gate...",
      redirectToWaitingAtGate: true,
    };
  }

  if (/not approved|waiting approval/i.test(message)) {
    return { kind: "not_approved", message: NOT_APPROVED_MESSAGE };
  }

  if (/invalid visitor qr/i.test(message)) {
    return {
      kind: "validation_failed",
      message: "QR not recognized. Opening Waiting at Gate...",
      redirectToWaitingAtGate: true,
    };
  }

  return {
    kind: "validation_failed",
    message: "QR not recognized. Opening Waiting at Gate...",
    redirectToWaitingAtGate: true,
  };
}

function mapCheckInError(error: unknown): GuardCheckInError {
  const code = getApiErrorCode(error);
  const message = getApiMessage(error, "Please try again.");

  if (code === "VISITOR_ALREADY_CHECKED_IN") {
    return { kind: "already_checked_in", message: ALREADY_CHECKED_IN_MESSAGE };
  }

  if (/already checked in/i.test(message)) {
    return { kind: "already_checked_in", message: ALREADY_CHECKED_IN_MESSAGE };
  }

  if (/expired/i.test(message)) {
    return { kind: "expired", message };
  }

  if (/not approved|waiting approval/i.test(message)) {
    return { kind: "not_approved", message: NOT_APPROVED_MESSAGE };
  }

  return { kind: "unknown", message };
}

export interface UseGuardCheckInResult {
  entry: ModelsVisitorEntry | null;
  isLoadingEntry: boolean;
  entryError: GuardCheckInError | null;
  scanOutcome: GuardScanOutcome;
  canCheckIn: boolean;
  disabledReason?: string;
  checkIn: () => Promise<void>;
  isCheckingIn: boolean;
  isCheckedIn: boolean;
}

export function useVisitorAlreadyCheckedIn(entry: ModelsVisitorEntry | null, isCheckedIn: boolean) {
  return Boolean(isCheckedIn || entry?.status === "checked_in");
}

function deriveScanOutcome(input: {
  entry: ModelsVisitorEntry | null;
  entryError: GuardCheckInError | null;
  isLoadingEntry: boolean;
  justCheckedInThisSession: boolean;
  canCheckIn: boolean;
  alreadyCheckedIn: boolean;
  hasQrToken: boolean;
}): GuardScanOutcome {
  const {
    entry,
    entryError,
    isLoadingEntry,
    justCheckedInThisSession,
    canCheckIn,
    alreadyCheckedIn,
    hasQrToken,
  } = input;

  if (isLoadingEntry || (hasQrToken && !entry && !entryError)) {
    return "loading";
  }

  if (entryError && !entry) {
    return "error";
  }

  if (!entry) {
    return "error";
  }

  if (justCheckedInThisSession) {
    return "just_checked_in";
  }

  if (alreadyCheckedIn || entry.status === "checked_in") {
    return "already_inside";
  }

  if (entry.status === "waiting_approval") {
    return "pending_approval";
  }

  if (canCheckIn) {
    return "ready";
  }

  return "blocked";
}

export function useGuardCheckIn(
  input: GuardCheckInInput | null,
  societyId: number | undefined,
): UseGuardCheckInResult {
  const [entry, setEntry] = useState<ModelsVisitorEntry | null>(null);
  const [entryError, setEntryError] = useState<GuardCheckInError | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [justCheckedInThisSession, setJustCheckedInThisSession] = useState(false);
  const checkInSubmittedRef = useRef(false);
  const qrToken = input?.token;

  const [validateQr, validateQrState] = usePostV1PublicVisitorEntriesQrValidateMutation();
  const [checkInMutation, checkInState] = usePostV1SocietiesBySocietyIdVisitorEntriesCheckInMutation();

  useEffect(() => {
    checkInSubmittedRef.current = false;
    setEntry(null);
    setEntryError(null);
    setIsCheckedIn(false);
    setJustCheckedInThisSession(false);

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

        setEntryError(mapValidateError(error));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qrToken, societyId, validateQr]);

  const alreadyCheckedIn = useVisitorAlreadyCheckedIn(entry, isCheckedIn);

  const canCheckIn =
    Boolean(entry?.status === "approved") &&
    !alreadyCheckedIn &&
    !checkInState.isLoading &&
    !validateQrState.isLoading;

  const disabledReason = (() => {
    if (!entry || alreadyCheckedIn) {
      return undefined;
    }

    if (entry.status === "waiting_approval") {
      return NOT_APPROVED_MESSAGE;
    }

    if (entry.status !== "approved") {
      return "This visitor cannot be checked in from this QR.";
    }

    return undefined;
  })();

  const scanOutcome = useMemo(
    () =>
      deriveScanOutcome({
        entry,
        entryError,
        isLoadingEntry: validateQrState.isLoading,
        justCheckedInThisSession,
        canCheckIn,
        alreadyCheckedIn,
        hasQrToken: Boolean(qrToken && societyId),
      }),
    [
      entry,
      entryError,
      validateQrState.isLoading,
      justCheckedInThisSession,
      canCheckIn,
      alreadyCheckedIn,
      qrToken,
      societyId,
    ],
  );

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
      setJustCheckedInThisSession(true);
      setEntryError(null);
    } catch (error) {
      checkInSubmittedRef.current = false;
      const mapped = mapCheckInError(error);
      setEntryError(mapped);
      if (mapped.kind === "already_checked_in") {
        setIsCheckedIn(true);
      }
    }
  }, [canCheckIn, checkInMutation, entry, qrToken, societyId]);

  return {
    entry,
    isLoadingEntry: validateQrState.isLoading,
    entryError,
    scanOutcome,
    canCheckIn,
    disabledReason,
    checkIn,
    isCheckingIn: checkInState.isLoading,
    isCheckedIn: alreadyCheckedIn,
  };
}
