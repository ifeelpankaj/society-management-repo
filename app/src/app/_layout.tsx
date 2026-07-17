import { Stack } from "expo-router";
import { Provider } from "react-redux";

import "../global.css";
import { ToastProvider } from "@/components/ui";
import { store } from "@/redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ToastProvider>
    </Provider>
  );
}
