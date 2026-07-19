"use client";

import type { PropsWithChildren } from "react";

import { useAppSelector } from "@/store/store";

import { useWebPushRegistration } from "@/lib/notifications/use-web-push-registration";

export function WebPushRegistrationProvider({ children }: PropsWithChildren) {
  const user = useAppSelector((state) => state.auth.user);
  useWebPushRegistration(Boolean(user));

  return children;
}
