import { usePathname, useRouter } from "expo-router";

import { ScanQrIcon } from "@/components/icons";
import { NotchedTabBar } from "@/components/layout/notched-tab-bar";
import { GuardTabIcon } from "@/features/guard/components/guard-tab-icons";
import {
  guardHomeRoute,
  guardProfileRoute,
  guardScannerRoute,
} from "@/features/guard/guard-routes";
import { colors } from "@/theme/colors";

type TabBarState = {
  index: number;
  routes: Array<{ name: string }>;
};

type GuardTab = "home" | "profile";

function resolveActiveTab(pathname: string, state: TabBarState): GuardTab {
  if (pathname.includes("/profile")) {
    return "profile";
  }

  const routeName = state.routes[state.index]?.name;
  if (routeName === "profile") {
    return "profile";
  }

  return "home";
}

export function GuardTabBar({ state }: { state: TabBarState }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname, state);

  const goToTab = (tab: GuardTab) => {
    if (tab === activeTab) {
      return;
    }

    router.replace(tab === "profile" ? guardProfileRoute() : guardHomeRoute());
  };

  return (
    <NotchedTabBar
      fab={{
        accessibilityLabel: "Scan QR",
        icon: <ScanQrIcon color={colors.brand.orangeSoft ?? "#1B1F3B"} size={22} />,
        label: "Scan",
        onPress: () => router.push(guardScannerRoute()),
      }}
      leftTab={{
        active: activeTab === "home",
        icon: (
          <GuardTabIcon
            color={activeTab === "home" ? colors.brand.orange : colors.text.placeholder}
            name="dashboard"
          />
        ),
        label: "Home",
        onPress: () => goToTab("home"),
      }}
      rightTab={{
        active: activeTab === "profile",
        icon: (
          <GuardTabIcon
            color={activeTab === "profile" ? colors.brand.orange : colors.text.placeholder}
            name="profile"
          />
        ),
        label: "Profile",
        onPress: () => goToTab("profile"),
      }}
    />
  );
}
