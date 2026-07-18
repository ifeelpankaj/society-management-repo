import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/use-auth";
import { GuardSocietyProvider } from "@/features/guard/guard-context";

export default function GuardStackLayout() {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  return (
    <GuardSocietyProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="add-entry" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="logs" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="pending" />
      </Stack>
    </GuardSocietyProvider>
  );
}
