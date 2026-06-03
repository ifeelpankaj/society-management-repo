"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { resolveAuthenticatedRoute } from "@/features/auth/auth-routing";
import { setCredentials } from "@/features/auth/auth-slice";
import type { User } from "@/features/auth/auth-types";
import { generatedApi } from "@/lib/api/generated-api";
import { useAppDispatch } from "@/store/store";

export function useCompleteAuthSession() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return useCallback(
    async (fallbackUser?: User | null) => {
      const profile = await dispatch(
        generatedApi.endpoints.getV1AuthProfile.initiate(undefined, {
          forceRefetch: true,
        }),
      ).unwrap();
      const user = profile.data?.user ?? fallbackUser ?? null;
      const societiesResponse = await dispatch(
        generatedApi.endpoints.getV1SocietiesMy.initiate(undefined, {
          forceRefetch: true,
        }),
      ).unwrap();
      const memberships = societiesResponse.data?.societies ?? [];
      const route = resolveAuthenticatedRoute(user, memberships);

      if (user) {
        dispatch(setCredentials({ user }));
      }

      router.replace(route);
      return route;
    },
    [dispatch, router],
  );
}
