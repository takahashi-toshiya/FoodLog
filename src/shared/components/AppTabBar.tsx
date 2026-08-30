import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme/colors";

export type AppTabKey = "today" | "library" | "settings";

type Tab = {
  key: AppTabKey;
  icon: string;
  label: string;
};

const TABS: Tab[] = [
  { key: "today", icon: "⌂", label: "今日" },
  { key: "library", icon: "▤", label: "ライブラリ" },
  { key: "settings", icon: "⚙", label: "設定" },
];

type AppTabBarProps = {
  activeTab: AppTabKey;
  onSelectTab?: (tab: AppTabKey) => void;
};

export function AppTabBar({ activeTab, onSelectTab }: AppTabBarProps) {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View accessibilityRole="tablist" style={styles.container}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={tab.key}
              onPress={() => onSelectTab?.(tab.key)}
              style={styles.tab}
            >
              <Text style={[styles.icon, isActive && styles.active]}>
                {tab.icon}
              </Text>
              <Text style={[styles.label, isActive && styles.active]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
  },
  container: {
    minHeight: 64,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
  tab: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 56,
  },
  icon: {
    color: colors.textMuted,
    fontSize: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  active: {
    color: colors.primary,
  },
});
