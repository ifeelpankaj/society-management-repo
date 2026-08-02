import { usePathname, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";

import { NotchedTabBar } from "@/components/layout/notched-tab-bar";
import { GuardTabIcon } from "@/features/guard/components/guard-tab-icons";
import { useResidentFeedback } from "@/features/resident/hooks/use-resident-feedback";
import { useResident } from "@/features/resident/resident-context";
import {
  residentDashboardRoute,
  residentProfileRoute,
  residentVisitorInviteRoute,
} from "@/features/resident/resident-routes";
import { colors } from "@/theme/colors";

type TabBarState = {
  index: number;
  routes: Array<{ name: string }>;
};

type ResidentTab = "home" | "profile";

function resolveActiveTab(pathname: string, state: TabBarState): ResidentTab {
  if (pathname.includes("/profile")) {
    return "profile";
  }

  const routeName = state.routes[state.index]?.name;
  if (routeName === "profile") {
    return "profile";
  }

  return "home";
}

export function ResidentTabBar({ state }: { state: TabBarState }) {
  const router = useRouter();
  const pathname = usePathname();
  const feedback = useResidentFeedback();
  const { canManageFlatVisitors } = useResident();
  const activeTab = resolveActiveTab(pathname, state);

  const goToTab = (tab: ResidentTab) => {
    if (tab === activeTab) {
      return;
    }

    router.replace(tab === "profile" ? residentProfileRoute() : residentDashboardRoute());
  };

  const goToInvite = () => {
    if (!canManageFlatVisitors) {
      feedback.showInfo(
        "Permission required",
        "Only active flat residents with visitor access can invite guests.",
      );
      return;
    }

    router.push(residentVisitorInviteRoute());
  };

  return (
    <NotchedTabBar
      fab={{
        accessibilityLabel: "Invite visitor",
        icon: (
          <SymbolView
            name={{ ios: "person.badge.plus", android: "person_add", web: "person_add" }}
            size={22}
            tintColor={colors.brand.orangeSoft ?? "#1B1F3B"}
          />
        ),
        label: "Invite",
        onPress: goToInvite,
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
