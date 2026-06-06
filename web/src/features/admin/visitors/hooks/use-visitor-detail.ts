"use client";

import { type ComponentProps, useCallback, useState } from "react";

import { useVisitorMutations } from "@/features/admin/visitors/hooks/use-visitor-mutations";
import {
  useGetV1SocietyVisitorEntryEventsQuery,
  useGetV1SocietyVisitorEntryQuery,
} from "@/lib/api/society-visitor-entries-api";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type UseVisitorDetailOptions = {
  societyId: number;
  entryId: number;
};

export function useVisitorDetail({ societyId, entryId }: UseVisitorDetailOptions) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const entryQuery = useGetV1SocietyVisitorEntryQuery({ societyId, entryId });
  const eventsQuery = useGetV1SocietyVisitorEntryEventsQuery({
    societyId,
    entryId,
  });

  const entry = entryQuery.data?.data?.entry;
  const events = eventsQuery.data?.data?.events ?? [];

  const refetch = useCallback(() => {
    entryQuery.refetch();
    eventsQuery.refetch();
  }, [entryQuery, eventsQuery]);

  const mutations = useVisitorMutations({ societyId, onSuccess: refetch });

  const isPending = entry?.status === "waiting_approval";
  const canCheckOut = entry?.status === "checked_in";

  const handleApprove = useCallback(async () => {
    if (!entry?.id) return;
    await mutations.handleApprove(entry.id);
    setApproveOpen(false);
  }, [entry, mutations]);

  const handleReject = useCallback(
    async (event: FormSubmitEvent) => {
      if (!entry?.id) return;
      const accepted = await mutations.handleReject(
        entry.id,
        rejectReason,
        event,
      );
      if (accepted) {
        setRejectOpen(false);
        setRejectReason("");
      }
    },
    [entry, mutations, rejectReason],
  );

  const handleCheckOut = useCallback(async () => {
    if (!entry?.id) return;
    await mutations.handleCheckOut(entry.id);
    setCheckOutOpen(false);
  }, [entry, mutations]);

  return {
    approveOpen,
    busy: mutations.busy,
    canCheckOut,
    checkOutOpen,
    entry,
    entryQuery,
    events,
    eventsQuery,
    handleApprove,
    handleCheckOut,
    handleReject,
    isPending,
    isRejecting: mutations.isRejecting,
    refetch,
    rejectOpen,
    rejectReason,
    setApproveOpen,
    setCheckOutOpen,
    setRejectOpen,
    setRejectReason,
  };
}
