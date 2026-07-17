import { Stack } from "expo-router";

import { ResidentProvider } from "@/features/resident/resident-context";

export default function ResidentStackLayout() {
  return (
    <ResidentProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="logs" />
        <Stack.Screen name="members/add" />
        <Stack.Screen name="visitors/index" />
        <Stack.Screen name="visitors/invite" />
        <Stack.Screen name="visitors/settings" />
      </Stack>
    </ResidentProvider>
  );
}
