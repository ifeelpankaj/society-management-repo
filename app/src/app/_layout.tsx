import { Stack } from "expo-router";
import { Provider } from "react-redux";

import "../global.css";
import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/features/auth/auth-provider";
import { store } from "@/redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </ToastProvider>
    </Provider>
  );
}
