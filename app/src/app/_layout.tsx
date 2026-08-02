import { AppToast } from "@/components/ui";
import { AppStatusBar } from "@/components/layout/app-status-bar";
import { AuthProvider } from "@/features/auth/auth-provider";
import { store } from "@/redux/store";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "@/lib/api/enhanced-api";
import "@/lib/api/resident-api-extensions";
import "@/lib/api/guard-api-extensions";
import { NotificationRegistrationProvider } from "@/features/notifications/notification-registration-provider";
import { NotificationSyncProvider } from "@/features/notifications/notification-sync-provider";
export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NotificationRegistrationProvider>
          <NotificationSyncProvider>
            <AppStatusBar />
            <Stack screenOptions={{ headerShown: false }} />
          </NotificationSyncProvider>
        </NotificationRegistrationProvider>
      </AuthProvider>
      <AppToast />
    </Provider>
  );
}
