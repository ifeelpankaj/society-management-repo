import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScanQrIcon } from "@/components/icons";
import { GuardTabIcon } from "@/features/guard/components/guard-tab-icons";
import { guardScannerRoute } from "@/features/guard/guard-routes";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

type GuardTabBarProps = {
  navigation: {
    navigate: (name: string) => void;
  };
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
};

export function GuardTabBar({ navigation, state }: GuardTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeRoute = state.routes[state.index]?.name;
  const profileIndex = state.routes.findIndex((route) => route.name === "profile");

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeRoute === "home" }}
        style={styles.tab}
        onPress={() => navigation.navigate("home")}
      >
        <GuardTabIcon
          color={activeRoute === "home" ? colors.brand.orange : colors.text.placeholder}
          name="dashboard"
        />
        <Text
          style={[
            styles.tabLabel,
            activeRoute === "home" ? styles.tabLabelActive : styles.tabLabelInactive,
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
        accessibilityState={{ selected: activeRoute === "profile" }}
        style={styles.tab}
        onPress={() => {
          if (profileIndex >= 0) {
            navigation.navigate(state.routes[profileIndex].name);
          }
        }}
      >
        <GuardTabIcon
          color={activeRoute === "profile" ? colors.brand.orange : colors.text.placeholder}
          name="profile"
        />
        <Text
          style={[
            styles.tabLabel,
            activeRoute === "profile" ? styles.tabLabelActive : styles.tabLabelInactive,
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
