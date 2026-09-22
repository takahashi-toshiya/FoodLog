import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/shared/theme/colors";

export type LibraryCategory = "foods" | "sets";

type LibraryCategoryTabsProps = {
  selectedCategory: LibraryCategory;
  onSelectCategory: (category: LibraryCategory) => void;
};

const CATEGORIES: { key: LibraryCategory; label: string }[] = [
  { key: "foods", label: "よく使う食品" },
  { key: "sets", label: "セット" },
];

export function LibraryCategoryTabs({
  selectedCategory,
  onSelectCategory,
}: LibraryCategoryTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {CATEGORIES.map((category) => {
        const isSelected = category.key === selectedCategory;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            key={category.key}
            onPress={() => onSelectCategory(category.key)}
            style={[styles.tab, isSelected && styles.selectedTab]}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.progressTrack,
    borderRadius: 12,
    flexDirection: "row",
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
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
  selectedLabel: {
    color: colors.text,
    fontWeight: "800",
  },
});
