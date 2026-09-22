import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/shared/theme/colors";

export type TodayRecordTab = "meals" | "weight";

type TodayRecordTabsProps = {
  selectedTab: TodayRecordTab;
  onSelectTab: (tab: TodayRecordTab) => void;
};

const TABS: { label: string; value: TodayRecordTab }[] = [
  { label: "食事", value: "meals" },
  { label: "体重", value: "weight" },
];

export function TodayRecordTabs({
  selectedTab,
  onSelectTab,
}: TodayRecordTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {TABS.map((tab) => {
        const isSelected = selectedTab === tab.value;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            key={tab.value}
            onPress={() => onSelectTab(tab.value)}
            style={[styles.tab, isSelected && styles.selectedTab]}
          >
            <Text
              style={[styles.tabText, isSelected && styles.selectedTabText]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 3,
  },
  tab: {
    alignItems: "center",
    borderRadius: 9,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },
  selectedTab: {
    backgroundColor: colors.surface,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  selectedTabText: {
    color: colors.text,
    fontWeight: "800",
  },
});
