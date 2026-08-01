import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScanQrIcon } from "@/components/icons";
import { GuardTabIcon } from "@/features/guard/components/guard-tab-icons";
import { guardHomeRoute, guardProfileRoute, guardScannerRoute } from "@/features/guard/guard-routes";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

type GuardTab = "home" | "profile";

function resolveActiveTab(pathname: string, state: BottomTabBarProps["state"]): GuardTab {
  if (pathname.includes("/profile")) {
    return "profile";
  }

  const routeName = state.routes[state.index]?.name;
  if (routeName === "profile") {
    return "profile";
  }

  return "home";
}

export function GuardTabBar({ state }: BottomTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const activeTab = resolveActiveTab(pathname, state);

  const goToTab = (tab: GuardTab) => {
    if (tab === activeTab) {
      return;
    }

    router.replace(tab === "profile" ? guardProfileRoute() : guardHomeRoute());
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "home" }}
        style={styles.tab}
        onPress={() => goToTab("home")}
      >
        <GuardTabIcon
          color={activeTab === "home" ? colors.brand.orange : colors.text.placeholder}
          name="dashboard"
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === "home" ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          Home
        </Text>
      </Pressable>

      <View style={styles.fabSlot}>
        <Pressable
          accessibilityLabel="Scan QR"
          accessibilityRole="button"
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => router.push(guardScannerRoute())}
        >
          <ScanQrIcon color={colors.text.inverse} size={24} />
          <Text style={styles.fabLabel}>Scan QR</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "profile" }}
        style={styles.tab}
        onPress={() => goToTab("profile")}
      >
        <GuardTabIcon
          color={activeTab === "profile" ? colors.brand.orange : colors.text.placeholder}
          name="profile"
        />
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
    alignItems: "flex-end",
    backgroundColor: colors.surface.card,
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    flexDirection: "row",
    height: layout.tabBarHeight,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  fab: {
    alignItems: "center",
    backgroundColor: colors.brand.orange,
    borderRadius: 999,
    gap: 2,
    height: layout.fabSize,
    justifyContent: "center",
    marginTop: -28,
    width: layout.fabSize,
    ...shadows.brand,
  },
  fabLabel: {
    color: colors.text.inverse,
    fontSize: 9,
    fontWeight: "700",
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  fabSlot: {
    alignItems: "center",
    flex: 1,
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
