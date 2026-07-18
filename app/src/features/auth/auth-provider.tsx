import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import type { ModelsUserResponse } from "@/lib/api/generated-api";
import { clearWorkspaceSelection } from "@/redux/appSlice";
import { clearAuth } from "@/redux/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { baseApi } from "@/redux/queries/baseApi";

import { completeAuthenticatedSession, restoreSession } from "./auth-bootstrap";
import {
  clearTokens,
  clearWorkspace,
  extractAuthSession,
  saveTokens,
  type AuthSessionPayload,
} from "./auth-storage";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: ModelsUserResponse | null;
  homeRoute: Href | null;
  completeLogin: (payload?: AuthSessionPayload & { user?: ModelsUserResponse | null }) => Promise<Href>;
  signOutLocal: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [homeRoute, setHomeRoute] = useState<Href | null>(null);

  const signOutLocal = useCallback(async () => {
    await clearTokens();
    await clearWorkspace();
    dispatch(clearAuth());
    dispatch(clearWorkspaceSelection());
    dispatch(baseApi.util.resetApiState());
    setHomeRoute(null);
    setStatus("unauthenticated");
  }, [dispatch]);

  const completeLogin = useCallback(
    async (payload?: AuthSessionPayload & { user?: ModelsUserResponse | null }) => {
      const session = extractAuthSession(payload ?? null);
      if (session) {
        await saveTokens(session);
      }

      const result = await completeAuthenticatedSession(dispatch, payload?.user ?? null);
      setHomeRoute(result.route);
      setStatus("authenticated");
      return result.route;
    },
    [dispatch],
  );

  useEffect(() => {
    let active = true;

    (async () => {
      const result = await restoreSession(dispatch);

      if (!active) {
        return;
      }

      if (result.status === "authenticated") {
        setHomeRoute(result.route);
        setStatus("authenticated");
      } else {
        setHomeRoute(null);
        setStatus("unauthenticated");
      }

      await SplashScreen.hideAsync().catch(() => undefined);
    })();

    return () => {
      active = false;
    };
  }, [dispatch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      homeRoute,
      completeLogin,
      signOutLocal,
    }),
    [completeLogin, homeRoute, signOutLocal, status, user],
  );

  if (status === "loading") {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function useAuthRedirect(route: Href) {
  const router = useRouter();
  const { homeRoute, status } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && homeRoute) {
      router.replace(homeRoute ?? route);
    }
  }, [homeRoute, route, router, status]);
}
