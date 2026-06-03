import { baseApi } from "@/lib/api/base-api";
import type {
  ModelsSocietyMemberResponse,
  ModelsSocietyResponse,
  ModelsUserResponse,
} from "@/lib/api/generated-api";

export type SocietyOnboardingBootstrap = {
  society?: ModelsSocietyResponse;
  has_flats?: boolean;
  has_staff?: boolean;
  is_onboarded?: boolean;
  flat_count?: number;
  staff_count?: number;
  missing_steps?: string[];
  next_path?: string;
};

export type SocietyOnboardingBootstrapApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    onboarding?: SocietyOnboardingBootstrap;
  };
};

export type CreateGuardRequest = {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number: string;
  password: string;
};

export type CreateGuardApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    guard?: {
      user?: ModelsUserResponse;
      member?: ModelsSocietyMemberResponse;
    };
  };
};

export const societyOnboardingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getV1SocietiesBySocietyIdOnboardingBootstrap: build.query<
      SocietyOnboardingBootstrapApiResponse,
      { societyId: number }
    >({
      query: ({ societyId }) => ({
        url: `/v1/societies/${societyId}/onboarding/bootstrap`,
      }),
      providesTags: ["Societies", "Flats", "Society Members"],
    }),
    postV1SocietiesBySocietyIdGuards: build.mutation<
      CreateGuardApiResponse,
      { societyId: number; createGuardRequest: CreateGuardRequest }
    >({
      query: ({ societyId, createGuardRequest }) => ({
        url: `/v1/societies/${societyId}/guards`,
        method: "POST",
        body: createGuardRequest,
      }),
      invalidatesTags: ["Society Members", "Societies"],
    }),
  }),
});

export const {
  useGetV1SocietiesBySocietyIdOnboardingBootstrapQuery,
  useLazyGetV1SocietiesBySocietyIdOnboardingBootstrapQuery,
  usePostV1SocietiesBySocietyIdGuardsMutation,
} = societyOnboardingApi;
