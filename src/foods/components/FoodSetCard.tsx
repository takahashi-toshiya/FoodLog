import { Pressable, StyleSheet, Text, View } from "react-native";

import { calculateFoodSetNutrition } from "@/foods/services/foodSetNutrition";
import type { FoodSet } from "@/foods/types/foodSet";
import { colors } from "@/shared/theme/colors";

type FoodSetCardProps = {
  foodSet: FoodSet;
  onPress: (foodSet: FoodSet) => void;
  onPressMenu: (foodSet: FoodSet) => void;
};

export function FoodSetCard({
  foodSet,
  onPress,
  onPressMenu,
}: FoodSetCardProps) {
  const totals = calculateFoodSetNutrition(foodSet);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityLabel={`${foodSet.name}を食事へ追加`}
        accessibilityRole="button"
        onPress={() => onPress(foodSet)}
        style={styles.mainAction}
      >
        <View style={styles.icon}>
          <Text style={styles.iconText}>組</Text>
        </View>
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.name}>
            {foodSet.name}
          </Text>
          <Text style={styles.details}>
            {foodSet.items.length}品 · {totals.calories} kcal
          </Text>
          <Text style={styles.nutrition}>
            P {formatNumber(totals.protein)} / F {formatNumber(totals.fat)} / C{" "}
            {formatNumber(totals.carbs)}
          </Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel={`${foodSet.name}のメニューを開く`}
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => onPressMenu(foodSet)}
        style={styles.menuButton}
      >
        <Text style={styles.menuText}>⋯</Text>
      </Pressable>
    </View>
  );
}

function formatNumber(value: number): number {
  return Number(value.toFixed(1));
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 9,
    minHeight: 76,
    padding: 8,
  },
  mainAction: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    padding: 3,
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconText: { color: colors.surface, fontSize: 14, fontWeight: "800" },
  content: { flex: 1 },
  name: { color: colors.text, fontSize: 13, fontWeight: "800" },
  details: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  nutrition: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    minWidth: 32,
  },
  menuText: { color: colors.textMuted, fontSize: 20 },
});
