import { baseApi } from "@/lib/api/base-api";
import type {
  SocietyFlatVisitorSettingRow,
  SocietyVisitorSettings,
  VisitorApprovalMode,
  VisitorPurpose,
} from "@/lib/api/visitor-types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export type UpdateSocietyVisitorSettingsArg = {
  societyId: number;
  approval_mode?: VisitorApprovalMode;
  default_visit_duration_minutes?: number;
  grace_period_minutes?: number;
  qr_expiry_minutes?: number;
  allow_resident_pre_approval?: boolean;
  allow_public_qr_entry?: boolean;
  allow_guard_entry?: boolean;
};

export type GetSocietyFlatVisitorSettingsArg = {
  societyId: number;
  flatId?: number;
  block?: string;
  purpose?: VisitorPurpose;
  limit?: number;
  offset?: number;
};

export type UpdateFlatVisitorSettingArg = {
  societyId: number;
  flatId: number;
  purpose: VisitorPurpose;
  approval_required?: boolean;
  default_visit_duration_minutes?: number;
  is_enabled?: boolean;
};

export const societyVisitorSettingsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1SocietyVisitorSettings: build.query<
      ApiEnvelope<{ visitor_settings?: SocietyVisitorSettings }>,
      { societyId: number }
    >({
      query: ({ societyId }) => ({
        url: `/v1/societies/${societyId}/visitor-settings`,
      }),
      providesTags: ["Visitor Settings"],
    }),
    patchV1SocietyVisitorSettings: build.mutation<
      ApiEnvelope<{ visitor_settings?: SocietyVisitorSettings }>,
      UpdateSocietyVisitorSettingsArg
    >({
      query: ({ societyId, ...body }) => ({
        url: `/v1/societies/${societyId}/visitor-settings`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Visitor Settings", "Flat Visitor Context"],
    }),
    getV1SocietyFlatVisitorSettings: build.query<
      ApiEnvelope<{
        settings?: SocietyFlatVisitorSettingRow[];
        total?: number;
        limit?: number;
        offset?: number;
      }>,
      GetSocietyFlatVisitorSettingsArg
    >({
      query: ({
        societyId,
        flatId,
        block,
        purpose,
        limit = 50,
        offset = 0,
      }) => ({
        url: `/v1/societies/${societyId}/visitor-settings/flats`,
        params: {
          flat_id: flatId,
          block,
          purpose,
          limit,
          offset,
        },
      }),
      providesTags: ["Visitor Settings"],
    }),
    patchV1SocietyFlatVisitorSetting: build.mutation<
      ApiEnvelope<{ visitor_setting?: SocietyFlatVisitorSettingRow }>,
      UpdateFlatVisitorSettingArg
    >({
      query: ({ societyId, flatId, purpose, ...body }) => ({
        url: `/v1/societies/${societyId}/flats/${flatId}/visitor-settings/${purpose}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Visitor Settings", "Flat Visitor Context"],
    }),
  }),
});

export const {
  useGetV1SocietyVisitorSettingsQuery,
  usePatchV1SocietyVisitorSettingsMutation,
  useGetV1SocietyFlatVisitorSettingsQuery,
  usePatchV1SocietyFlatVisitorSettingMutation,
} = societyVisitorSettingsApi;
