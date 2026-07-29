import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { layout } from "@/theme/layout";
import { spacing } from "@/theme/spacing";

type ResidentTabBarProps = {
  navigation: {
    navigate: (name: string) => void;
  };
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
};

export function ResidentTabBar({ navigation, state }: ResidentTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {(["dashboard", "profile"] as const).map((routeName) => {
        const isActive = activeRoute === routeName;
        const label = routeName === "dashboard" ? "Home" : "Profile";
        const icon =
          routeName === "dashboard"
            ? ({ ios: "house.fill", android: "home", web: "home" } as const)
            : ({ ios: "person.crop.circle", android: "account_circle", web: "account_circle" } as const);

        return (
          <Pressable
            key={routeName}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={styles.tab}
            onPress={() => navigation.navigate(routeName)}
          >
            <SymbolView
              name={icon}
              size={22}
              tintColor={isActive ? colors.brand.orange : colors.text.placeholder}
            />
            <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
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
