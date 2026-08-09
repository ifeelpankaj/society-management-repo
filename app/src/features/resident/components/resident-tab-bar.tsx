import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";

import { RoleTabBar } from "@/components/layout/role-tab-bar";
import { useAppFeedback } from "@/features/shared/use-app-feedback";
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

export function ResidentTabBar({ state }: { state: TabBarState }) {
  const router = useRouter();
  const feedback = useAppFeedback();
  const { canManageFlatVisitors } = useResident();

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
    <RoleTabBar
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
      homeRoute={residentDashboardRoute()}
      profileRoute={residentProfileRoute()}
      state={state}
    />
  );
}
