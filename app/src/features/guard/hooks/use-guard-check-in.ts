import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getApiErrorCode, getApiMessage } from "@/features/auth/api-error";
import type { GuardCheckInInput } from "@/features/guard/guard-routes";
import {
  type ModelsVisitorEntry,
  useGetV1SocietiesBySocietyIdVisitorEntriesAndEntryIdQuery,
  usePostV1PublicVisitorEntriesQrValidateMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckInMutation,
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

function mapEntryLoadError(error: unknown): GuardCheckInError {
  const message = getApiMessage(error, "Could not load visitor entry.");
  return { kind: "unknown", message };
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
  refreshEntry: () => void;
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
  isResolvingEntry: boolean;
}): GuardScanOutcome {
  const {
    entry,
    entryError,
    isLoadingEntry,
    justCheckedInThisSession,
    canCheckIn,
    alreadyCheckedIn,
    isResolvingEntry,
  } = input;

  if (isLoadingEntry || isResolvingEntry) {
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
  const [qrEntry, setQrEntry] = useState<ModelsVisitorEntry | null>(null);
  const [entryError, setEntryError] = useState<GuardCheckInError | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [justCheckedInThisSession, setJustCheckedInThisSession] = useState(false);
  const checkInSubmittedRef = useRef(false);

  const isQrSource = input?.source === "qr";
  const isEntrySource = input?.source === "entry";
  const qrToken = input?.source === "qr" ? input.token : input?.source === "entry" ? input.token : undefined;
  const entryId = input?.source === "entry" ? input.entryId : 0;

  const [validateQr, validateQrState] = usePostV1PublicVisitorEntriesQrValidateMutation();
  const [checkInByToken, checkInByTokenState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesCheckInMutation();
  const [checkInByEntryId, checkInByEntryIdState] =
    usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckInMutation();

  const entryQuery = useGetV1SocietiesBySocietyIdVisitorEntriesAndEntryIdQuery(
    { societyId: societyId ?? 0, entryId },
    { skip: !isEntrySource || !societyId || entryId <= 0 },
  );

  useEffect(() => {
    checkInSubmittedRef.current = false;
    setQrEntry(null);
    setEntryError(null);
    setIsCheckedIn(false);
    setJustCheckedInThisSession(false);

    if (!input || !societyId) {
      setEntryError({
        kind: "invalid_params",
        message: "This check-in link is invalid or incomplete.",
      });
      return;
    }

    if (!isQrSource) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await validateQr({
          modelsQrTokenRequest: { token: input.token },
        }).unwrap();

        if (cancelled) {
          return;
        }

        const validatedEntry = response.data?.entry ?? null;
        setQrEntry(validatedEntry);

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
  }, [input, isQrSource, societyId, validateQr]);

  useEffect(() => {
    if (!isEntrySource) {
      return;
    }

    if (entryQuery.isError) {
      setEntryError(mapEntryLoadError(entryQuery.error));
      return;
    }

    if (entryQuery.data?.data?.entry) {
      setEntryError(null);
      if (entryQuery.data.data.entry.status === "checked_in") {
        setIsCheckedIn(true);
      }
    }
  }, [entryQuery.data, entryQuery.error, entryQuery.isError, isEntrySource]);

  const entry = isEntrySource ? (entryQuery.data?.data?.entry ?? null) : qrEntry;
  const isLoadingEntry = isQrSource
    ? validateQrState.isLoading
    : entryQuery.isLoading || entryQuery.isFetching;
  const isCheckingIn = checkInByTokenState.isLoading || checkInByEntryIdState.isLoading;
  const alreadyCheckedIn = useVisitorAlreadyCheckedIn(entry, isCheckedIn);

  const canCheckIn =
    Boolean(entry?.status === "approved") &&
    !alreadyCheckedIn &&
    !isCheckingIn &&
    !isLoadingEntry;

  const disabledReason = (() => {
    if (!entry || alreadyCheckedIn) {
      return undefined;
    }

    if (entry.status === "waiting_approval") {
      return NOT_APPROVED_MESSAGE;
    }

    if (entry.status !== "approved") {
      return "This visitor cannot be checked in yet.";
    }

    return undefined;
  })();

  const scanOutcome = useMemo(
    () =>
      deriveScanOutcome({
        entry,
        entryError,
        isLoadingEntry,
        justCheckedInThisSession,
        canCheckIn,
        alreadyCheckedIn,
        isResolvingEntry: isQrSource && Boolean(input?.source === "qr" && !entry && !entryError),
      }),
    [
      entry,
      entryError,
      isLoadingEntry,
      justCheckedInThisSession,
      canCheckIn,
      alreadyCheckedIn,
      isQrSource,
      input,
    ],
  );

  const checkIn = useCallback(async () => {
    if (!societyId || !canCheckIn || checkInSubmittedRef.current || !entry) {
      return;
    }

    checkInSubmittedRef.current = true;

    try {
      if (qrToken) {
        const response = await checkInByToken({
          societyId,
          modelsQrTokenRequest: { token: qrToken },
        }).unwrap();
        setQrEntry(response.data?.entry ?? entry);
      } else if (isEntrySource && entry.id) {
        const response = await checkInByEntryId({
          societyId,
          entryId: entry.id,
        }).unwrap();
        if (isQrSource) {
          setQrEntry(response.data?.entry ?? entry);
        } else {
          void entryQuery.refetch();
        }
      } else {
        throw new Error("Missing check-in credentials.");
      }

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
  }, [
    canCheckIn,
    checkInByEntryId,
    checkInByToken,
    entry,
    entryQuery,
    isEntrySource,
    isQrSource,
    qrToken,
    societyId,
  ]);

  const refreshEntry = useCallback(() => {
    if (isEntrySource) {
      void entryQuery.refetch();
    }
  }, [entryQuery, isEntrySource]);

  return {
    entry,
    isLoadingEntry,
    entryError,
    scanOutcome,
    canCheckIn,
    disabledReason,
    checkIn,
    isCheckingIn,
    isCheckedIn: alreadyCheckedIn,
    refreshEntry,
  };
}
