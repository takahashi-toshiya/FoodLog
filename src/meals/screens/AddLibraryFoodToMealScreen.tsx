import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { FoodRepository } from "@/foods/storage/FoodRepository";
import { AddMealScreen } from "@/meals/screens/AddMealScreen";
import { createMealInputPresetFromFood } from "@/meals/services/foodMealPreset";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { MealType } from "@/meals/types/meal";
import type { MealInputPreset } from "@/meals/types/mealInput";
import { colors } from "@/shared/theme/colors";

type AddLibraryFoodToMealScreenProps = {
  foodId: string;
  initialDate: string;
  initialMealType: MealType;
  foodRepository: FoodRepository;
  mealRepository: MealRepository;
  onCancel: () => void;
  onSaved: (date: string) => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; preset: MealInputPreset }
  | { status: "notFound" }
  | { status: "error" };

export function AddLibraryFoodToMealScreen({
  foodId,
  initialDate,
  initialMealType,
  foodRepository,
  mealRepository,
  onCancel,
  onSaved,
}: AddLibraryFoodToMealScreenProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [retryToken, setRetryToken] = useState(0);

  const loadFood = useCallback(async () => {
    setLoadState({ status: "loading" });

    try {
      const food = await foodRepository.findById(foodId);
      setLoadState(
        food
          ? { status: "ready", preset: createMealInputPresetFromFood(food) }
          : { status: "notFound" },
      );
    } catch (error) {
      console.error("食品の取得に失敗しました", error);
      setLoadState({ status: "error" });
    }
  }, [foodId, foodRepository]);

  useEffect(() => {
    void loadFood();
  }, [loadFood, retryToken]);

  if (loadState.status === "ready") {
    return (
      <AddMealScreen
        initialDate={initialDate}
        initialMealType={initialMealType}
        initialPreset={loadState.preset}
        onCancel={onCancel}
        onSaved={onSaved}
        repository={mealRepository}
      />
    );
  }

  const isError = loadState.status === "error";
  const message =
    loadState.status === "loading"
      ? "食品を読み込んでいます"
      : isError
        ? "食品を読み込めませんでした"
        : "指定した食品が見つかりません";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>{message}</Text>
        {isError ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRetryToken((current) => current + 1)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>もう一度読み込む</Text>
          </Pressable>
        ) : null}
        {loadState.status !== "loading" ? (
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>閉じる</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  stateContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 20,
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
  closeButton: { marginTop: 10, minHeight: 44, padding: 12 },
  closeButtonText: { color: colors.textMuted, fontSize: 13 },
});
