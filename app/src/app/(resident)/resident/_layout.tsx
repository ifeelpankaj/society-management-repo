import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/features/auth/use-auth";
import { ResidentProvider } from "@/features/resident/resident-context";
import { ResidentTabBar } from "@/features/resident/components/resident-tab-bar";

export default function ResidentStackLayout() {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return <Redirect href="/login" />;
  }

  return (
    <ResidentProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <ResidentTabBar {...props} />}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Home" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        <Tabs.Screen name="logs" options={{ href: null }} />
        <Tabs.Screen name="entries/index" options={{ href: null }} />
        <Tabs.Screen name="members/index" options={{ href: null }} />
        <Tabs.Screen name="members/add" options={{ href: null }} />
        <Tabs.Screen name="visitors/index" options={{ href: null }} />
        <Tabs.Screen name="visitors/invite" options={{ href: null }} />
        <Tabs.Screen name="visitors/settings" options={{ href: null }} />
      </Tabs>
    </ResidentProvider>
  );
}
