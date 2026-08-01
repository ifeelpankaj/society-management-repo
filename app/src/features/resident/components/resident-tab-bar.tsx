import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  residentDashboardRoute,
  residentProfileRoute,
} from "@/features/resident/resident-routes";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";

type ResidentTab = "home" | "profile";

function resolveActiveTab(pathname: string, state: BottomTabBarProps["state"]): ResidentTab {
  if (pathname.includes("/profile")) {
    return "profile";
  }

  const routeName = state.routes[state.index]?.name;
  if (routeName === "profile") {
    return "profile";
  }

  return "home";
}

export function ResidentTabBar({ state }: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const activeTab = resolveActiveTab(pathname, state);

  const goToTab = (tab: ResidentTab) => {
    if (tab === activeTab) {
      return;
    }

    router.replace(tab === "profile" ? residentProfileRoute() : residentDashboardRoute());
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "home" }}
        style={styles.tab}
        onPress={() => goToTab("home")}
      >
        <View style={[styles.iconPill, activeTab === "home" && styles.iconPillActive]}>
          <SymbolView
            name={{ ios: "house.fill", android: "home", web: "home" }}
            size={22}
            tintColor={activeTab === "home" ? colors.brand.orange : colors.text.placeholder}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === "home" ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          Home
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "profile" }}
        style={styles.tab}
        onPress={() => goToTab("profile")}
      >
        <View style={[styles.iconPill, activeTab === "profile" && styles.iconPillActive]}>
          <SymbolView
            name={{ ios: "person.crop.circle", android: "account_circle", web: "account_circle" }}
            size={22}
            tintColor={activeTab === "profile" ? colors.brand.orange : colors.text.placeholder}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === "profile" ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          Profile
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    flexDirection: "row",
    height: layout.tabBarHeight,
    paddingHorizontal: spacing["2xl"],
    paddingTop: spacing.sm,
  },
  iconPill: {
    alignItems: "center",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconPillActive: {
    backgroundColor: colors.dashboard.actionOrangeSoft,
  },
  tab: {
    alignItems: "center",
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: colors.brand.orange,
  },
  tabLabelInactive: {
    color: colors.text.placeholder,
  },
});
