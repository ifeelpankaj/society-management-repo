import { baseApi } from "@/lib/api/base-api";
import type {
  FlatVisitorContext,
  MemberVisitorApprovalStats,
  VisitorEntry,
  VisitorEntryEvent,
  VisitorEntryStats,
  VisitorPendingEntry,
  VisitorPurpose,
  VisitorSource,
  VisitorStatus,
} from "@/lib/api/visitor-types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export type GetVisitorEntriesArg = {
  societyId: number;
  flatId?: number;
  status?: VisitorStatus;
  source?: VisitorSource;
  purpose?: VisitorPurpose;
  block?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
};

export type GetVisitorEntryArg = {
  societyId: number;
  entryId: number;
};

export type GetVisitorPendingArg = {
  societyId: number;
  flatId?: number;
  block?: string;
  limit?: number;
  offset?: number;
};

export type VisitorEntryMutationArg = {
  societyId: number;
  entryId: number;
  reason?: string;
};

export const societyVisitorEntriesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1SocietyVisitorEntryStats: build.query<
      ApiEnvelope<{ stats?: VisitorEntryStats }>,
      { societyId: number }
    >({
      query: ({ societyId }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/stats`,
      }),
      providesTags: ["Visitor Entries"],
    }),
    getV1SocietyVisitorEntries: build.query<
      ApiEnvelope<{
        entries?: VisitorEntry[];
        total?: number;
        limit?: number;
        offset?: number;
      }>,
      GetVisitorEntriesArg
    >({
      query: ({
        societyId,
        flatId,
        status,
        source,
        purpose,
        block,
        createdFrom,
        createdTo,
        limit = 20,
        offset = 0,
      }) => ({
        url: `/v1/societies/${societyId}/visitor-entries`,
        params: {
          flat_id: flatId,
          status,
          source,
          purpose,
          block,
          created_from: createdFrom,
          created_to: createdTo,
          limit,
          offset,
        },
      }),
      providesTags: ["Visitor Entries"],
    }),
    getV1SocietyVisitorEntry: build.query<
      ApiEnvelope<{ entry?: VisitorEntry }>,
      GetVisitorEntryArg
    >({
      query: ({ societyId, entryId }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Visitor Entries", id: arg.entryId },
      ],
    }),
    getV1SocietyVisitorEntryEvents: build.query<
      ApiEnvelope<{ events?: VisitorEntryEvent[] }>,
      GetVisitorEntryArg
    >({
      query: ({ societyId, entryId }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}/events`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Visitor Entries", id: `events-${arg.entryId}` },
      ],
    }),
    getV1SocietyVisitorPendingApprovals: build.query<
      ApiEnvelope<{
        entries?: VisitorPendingEntry[];
        total?: number;
        limit?: number;
        offset?: number;
      }>,
      GetVisitorPendingArg
    >({
      query: ({ societyId, flatId, block, limit = 20, offset = 0 }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/pending`,
        params: { flat_id: flatId, block, limit, offset },
      }),
      providesTags: ["Visitor Entries"],
    }),
    getV1SocietyFlatVisitorContext: build.query<
      ApiEnvelope<{ context?: FlatVisitorContext }>,
      { societyId: number; flatId: number }
    >({
      query: ({ societyId, flatId }) => ({
        url: `/v1/societies/${societyId}/flats/${flatId}/visitor-context`,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Flat Visitor Context", id: arg.flatId },
      ],
    }),
    getV1SocietyMemberVisitorApprovalStats: build.query<
      ApiEnvelope<{ stats?: MemberVisitorApprovalStats }>,
      { societyId: number; memberId: number }
    >({
      query: ({ societyId, memberId }) => ({
        url: `/v1/societies/${societyId}/members/${memberId}/visitor-approval-stats`,
      }),
      providesTags: ["Visitor Entries"],
    }),
    postV1SocietyVisitorEntryApprove: build.mutation<
      ApiEnvelope<{ entry?: VisitorEntry }>,
      VisitorEntryMutationArg
    >({
      query: ({ societyId, entryId }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Visitor Entries", "Flat Visitor Context"],
    }),
    postV1SocietyVisitorEntryReject: build.mutation<
      ApiEnvelope<unknown>,
      VisitorEntryMutationArg
    >({
      query: ({ societyId, entryId, reason }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Visitor Entries", "Flat Visitor Context"],
    }),
    postV1SocietyVisitorEntryCheckOut: build.mutation<
      ApiEnvelope<{ entry?: VisitorEntry }>,
      VisitorEntryMutationArg
    >({
      query: ({ societyId, entryId }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}/check-out`,
        method: "POST",
      }),
      invalidatesTags: ["Visitor Entries"],
    }),
  }),
});

export const {
  useGetV1SocietyVisitorEntryStatsQuery,
  useGetV1SocietyVisitorEntriesQuery,
  useGetV1SocietyVisitorEntryQuery,
  useGetV1SocietyVisitorEntryEventsQuery,
  useGetV1SocietyVisitorPendingApprovalsQuery,
  useGetV1SocietyFlatVisitorContextQuery,
  useGetV1SocietyMemberVisitorApprovalStatsQuery,
  usePostV1SocietyVisitorEntryApproveMutation,
  usePostV1SocietyVisitorEntryRejectMutation,
  usePostV1SocietyVisitorEntryCheckOutMutation,
} = societyVisitorEntriesApi;
