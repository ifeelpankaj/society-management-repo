import { Stack } from "expo-router";
import { Provider } from "react-redux";

import "@/lib/api/enhanced-api";
import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/features/auth/auth-provider";
import { NotificationRegistrationProvider } from "@/features/notifications/notification-registration-provider";
import { NotificationSyncProvider } from "@/features/notifications/notification-sync-provider";
import { store } from "@/redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthProvider>
          <NotificationRegistrationProvider>
            <NotificationSyncProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </NotificationSyncProvider>
          </NotificationRegistrationProvider>
        </AuthProvider>
      </ToastProvider>
    </Provider>
  );
}
