import { Pressable, StyleSheet, Text, View } from "react-native";

import type { FoodItem } from "@/foods/types/food";
import { colors } from "@/shared/theme/colors";

type FoodCardProps = {
  food: FoodItem;
  accentColor: string;
  onPress?: (food: FoodItem) => void;
  onPressMenu?: (food: FoodItem) => void;
};

export function FoodCard({
  food,
  accentColor,
  onPress,
  onPressMenu,
}: FoodCardProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={`${food.name}を選択`}
        accessibilityRole="button"
        onPress={() => onPress?.(food)}
        style={styles.selectionButton}
      >
        <View style={[styles.initial, { backgroundColor: accentColor }]}>
          <Text style={styles.initialText}>{food.name.slice(0, 1)}</Text>
        </View>

        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.name}>
            {food.name}
          </Text>
          <Text numberOfLines={1} style={styles.details}>
            {food.servingAmount}
            {food.servingUnit} · {food.calories} kcal · P {food.protein} / F{" "}
            {food.fat} / C {food.carbs}
          </Text>
        </View>
      </Pressable>

      {onPressMenu ? (
        <Pressable
          accessibilityLabel={`${food.name}のメニューを開く`}
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => onPressMenu(food)}
          style={styles.menuButton}
        >
          <Text style={styles.menuText}>⋯</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 9,
    minHeight: 64,
    overflow: "hidden",
  },
  selectionButton: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 62,
    padding: 11,
  },
  initial: {
    alignItems: "center",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  initialText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
  },
  content: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  details: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    minWidth: 32,
    marginRight: 8,
  },
  menuText: {
    color: colors.textMuted,
    fontSize: 20,
  },
});
