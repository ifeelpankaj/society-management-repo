import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  type FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
} from "@/features/auth/auth-routing";
import { clearAuth, setCredentials } from "@/features/auth/auth-slice";
import type { User } from "@/features/auth/auth-types";
import { appConfig } from "@/lib/config";

const API_BASE_URL = appConfig.apiBaseUrl || "http://localhost:8080/api";

const apiTagTypes = [
  "Auth",
  "Bootstrap",
  "Health",
  "Societies",
  "Society Members",
  "Flats",
  "Flat Residents",
  "Flat Claims",
  "Plans",
  "Public",
  "Subscriptions",
] as const;

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("accept", "application/json");
    return headers;
  },
});

const PUBLIC_AUTH_PATHS = [
  "/v1/auth/login",
  "/v1/auth/refresh",
  "/v1/auth/forgot-password",
  "/v1/auth/forget-password",
  "/v1/auth/register",
  "/v1/auth/resident/register",
  "/v1/auth/reset-password",
  "/v1/auth/verify-otp",
  "/v1/auth/resend-otp",
];

function getRequestUrl(args: string | FetchArgs) {
  return typeof args === "string" ? args : args.url;
}

function shouldSkipReauth(args: string | FetchArgs) {
  const url = getRequestUrl(args);
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

function isLoginRequest(args: string | FetchArgs) {
  return getRequestUrl(args).includes("/v1/auth/login");
}

function getApiErrorCode(result: { error?: FetchBaseQueryError }) {
  const data = result.error?.data;

  if (!data || typeof data !== "object" || !("error" in data)) {
    return undefined;
  }

  const error = data.error;
  if (!error || typeof error !== "object" || !("code" in error)) {
    return undefined;
  }

  return typeof error.code === "string" ? error.code : undefined;
}

function shouldSyncProfileForForbidden(
  args: string | FetchArgs,
  result: { error?: FetchBaseQueryError },
) {
  const url = getRequestUrl(args);

  return (
    result.error?.status === 403 &&
    getApiErrorCode(result) === "FORBIDDEN" &&
    !shouldSkipReauth(args) &&
    !url.includes("/v1/auth/profile")
  );
}

function shouldRedirectToLogin() {
  if (typeof window === "undefined") {
    return false;
  }

  return PROTECTED_ROUTE_PREFIXES.some((path) =>
    window.location.pathname.startsWith(path),
  );
}

function clearSessionAfterAuthFailure(
  api: Parameters<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  >[1],
) {
  api.dispatch(clearAuth());

  if (shouldRedirectToLogin()) {
    window.location.replace(AUTH_ROUTES.login);
  }
}

async function syncProfileSession(
  api: Parameters<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  >[1],
  extraOptions: Parameters<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  >[2],
) {
  const profileResult = await baseQuery(
    { url: "/v1/auth/profile" },
    api,
    extraOptions,
  );

  if (profileResult.error || !profileResult.data) {
    return false;
  }

  const data = profileResult.data as { data?: { user?: User | null } };
  const user = data.data?.user ?? null;

  if (user) {
    api.dispatch(setCredentials({ user }));
  }

  return true;
}

let refreshPromise: Promise<boolean> | null = null;
let refreshFailed = false;

export const resetRefreshState = () => {
  refreshPromise = null;
  refreshFailed = false;
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (!result.error && isLoginRequest(args)) {
    resetRefreshState();
  }

  if (shouldSyncProfileForForbidden(args, result)) {
    const profileSynced = await syncProfileSession(api, extraOptions);

    if (profileSynced) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  if (result.error?.status === 401 && !shouldSkipReauth(args)) {
    if (refreshFailed) {
      clearSessionAfterAuthFailure(api);
      return result;
    }

    if (!refreshPromise) {
      refreshPromise = (async (): Promise<boolean> => {
        const refreshResult = await baseQuery(
          { url: "/v1/auth/refresh", method: "POST" },
          api,
          extraOptions,
        );

        if (refreshResult.error || !refreshResult.data) {
          refreshFailed = true;
          clearSessionAfterAuthFailure(api);
          return false;
        }

        refreshFailed = false;
        return true;
      })().finally(() => {
        setTimeout(() => {
          refreshPromise = null;
        }, 100);
      });
    }

    const refreshSucceeded = await refreshPromise;
    if (refreshSucceeded) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: apiTagTypes,
  keepUnusedDataFor: 120,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
