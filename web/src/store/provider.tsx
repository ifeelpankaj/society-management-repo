"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { WebPushRegistrationProvider } from "@/features/notifications/web-push-registration-provider";
import { store } from "./store";

type StoreProviderProps = {
  children: ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <WebPushRegistrationProvider>{children}</WebPushRegistrationProvider>
    </Provider>
  );
}
