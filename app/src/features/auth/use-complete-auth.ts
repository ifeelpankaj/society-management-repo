import { useRouter } from "expo-router";

import type { ModelsUserResponse } from "@/lib/api/generated-api";
import { generatedApi } from "@/lib/api/generated-api";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/authSlice";

import { resolveBootstrapRoute } from "./bootstrap-routing";

export function useCompleteAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return async (user?: ModelsUserResponse | null) => {
    if (user) {
      dispatch(setCredentials({ user }));
    }

    const request = dispatch(
      generatedApi.endpoints.getV1Bootstrap.initiate(undefined, {
        forceRefetch: true,
      }),
    );

    try {
      const bootstrap = await request.unwrap();
      const bootstrapUser = bootstrap.data?.user ?? user ?? null;

      dispatch(setCredentials({ user: bootstrapUser }));
      router.replace(resolveBootstrapRoute(bootstrap.data));
    } finally {
      request.unsubscribe();
    }
  };
}
