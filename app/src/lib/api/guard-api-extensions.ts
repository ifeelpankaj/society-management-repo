import { enhancedApi } from "@/lib/api/enhanced-api";
import type {
  ModelsGuardApproveEntryRequest,
  ModelsVisitorEntry,
} from "@/lib/api/generated-api";

type VisitorEntryListPayload = {
  entries?: ModelsVisitorEntry[];
  total?: number;
  limit?: number;
  offset?: number;
};

type GuardActionResponse = {
  data?: { entry?: ModelsVisitorEntry; qr?: { token?: string; expires_at?: string } };
  message?: string;
  success?: boolean;
};

type WaitingAtGateResponse = {
  data?: VisitorEntryListPayload;
  message?: string;
  success?: boolean;
};

export const guardApiExtensions = enhancedApi.injectEndpoints({
  endpoints: (build) => ({
    getV1SocietiesBySocietyIdVisitorEntriesWaitingAtGate: build.query<
      WaitingAtGateResponse,
      { societyId: number; search?: string; limit?: number; offset?: number }
    >({
      query: ({ societyId, search, limit, offset }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/waiting-at-gate`,
        params: { search, limit, offset },
      }),
      providesTags: ["VisitorWaitingAtGate", "Visitor Entries"],
    }),
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdNotify: build.mutation<
      { success?: boolean; message?: string },
      { societyId: number; entryId: number }
    >({
      query: ({ societyId, entryId }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}/notify`,
        method: "POST",
      }),
      invalidatesTags: ["VisitorPending"],
    }),
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdGuardApprove: build.mutation<
      GuardActionResponse,
      { societyId: number; entryId: number; modelsGuardApproveEntryRequest?: ModelsGuardApproveEntryRequest }
    >({
      query: ({ societyId, entryId, modelsGuardApproveEntryRequest }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}/guard-approve`,
        method: "POST",
        body: modelsGuardApproveEntryRequest ?? {},
      }),
      invalidatesTags: ["VisitorPending", "VisitorWaitingAtGate", "GuardDesk", "VisitorStats", "Visitor Entries"],
    }),
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApproveAndCheckIn: build.mutation<
      GuardActionResponse,
      { societyId: number; entryId: number; modelsGuardApproveEntryRequest?: ModelsGuardApproveEntryRequest }
    >({
      query: ({ societyId, entryId, modelsGuardApproveEntryRequest }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}/approve-and-check-in`,
        method: "POST",
        body: modelsGuardApproveEntryRequest ?? {},
      }),
      invalidatesTags: [
        "VisitorPending",
        "VisitorWaitingAtGate",
        "GuardDesk",
        "VisitorStats",
        "Visitor Entries",
      ],
    }),
    postV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckInById: build.mutation<
      GuardActionResponse,
      { societyId: number; entryId: number }
    >({
      query: ({ societyId, entryId }) => ({
        url: `/v1/societies/${societyId}/visitor-entries/${entryId}/check-in`,
        method: "POST",
      }),
      invalidatesTags: ["VisitorWaitingAtGate", "GuardDesk", "VisitorStats", "Visitor Entries"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetV1SocietiesBySocietyIdVisitorEntriesWaitingAtGateQuery,
  useLazyGetV1SocietiesBySocietyIdVisitorEntriesWaitingAtGateQuery,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdNotifyMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdGuardApproveMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdApproveAndCheckInMutation,
  usePostV1SocietiesBySocietyIdVisitorEntriesAndEntryIdCheckInByIdMutation,
} = guardApiExtensions;
