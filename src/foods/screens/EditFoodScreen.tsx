import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FoodForm } from "@/foods/components/FoodForm";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { CreateFoodInput, FoodItem } from "@/foods/types/food";
import type { FoodInputValues } from "@/foods/types/foodInput";
import { calculateCalories } from "@/shared/services/nutrition";
import { colors } from "@/shared/theme/colors";

type EditFoodScreenProps = {
  foodId: string;
  repository: FoodRepository;
  onCancel: () => void;
  onSaved: () => void;
};

export function EditFoodScreen({
  foodId,
  repository,
  onCancel,
  onSaved,
}: EditFoodScreenProps) {
  const [food, setFood] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadFood = async () => {
      try {
        const found = await repository.findById(foodId);
        if (!isActive) {
          return;
        }

        setFood(found);
        setLoadError(found ? null : "編集する食品が見つかりませんでした");
      } catch (error) {
        console.error("食品の取得に失敗しました", error);
        if (isActive) {
          setLoadError("食品を読み込めませんでした");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadFood();

    return () => {
      isActive = false;
    };
  }, [foodId, repository]);

  const handleSubmit = async (input: CreateFoodInput) => {
    await repository.update(foodId, input);
    onSaved();
  };

  if (isLoading) {
    return <StatusScreen message="食品を読み込んでいます" />;
  }

  if (!food || loadError) {
    return (
      <StatusScreen
        actionLabel="閉じる"
        message={loadError ?? "編集する食品が見つかりませんでした"}
        onAction={onCancel}
      />
    );
  }

  return (
    <FoodForm
      closeAccessibilityLabel="食品編集を閉じる"
      initialValues={createInitialValues(food)}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      submitLabel="ライブラリの変更を保存"
      title="ライブラリの食品を編集"
    />
  );
}

type StatusScreenProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
};

function StatusScreen({ actionLabel, message, onAction }: StatusScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.statusContent}>
        <Text style={styles.statusText}>{message}</Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function createInitialValues(food: FoodItem): FoodInputValues {
  const calculatedCalories = calculateCalories(
    food.protein,
    food.fat,
    food.carbs,
  );
  const isCalculated = calculatedCalories === food.calories;

  return {
    name: food.name,
    servingAmount: String(food.servingAmount),
    servingUnit: food.servingUnit,
    protein: String(food.protein),
    fat: String(food.fat),
    carbs: String(food.carbs),
    calorieMode: isCalculated ? "calculated" : "manual",
    manualCalories: isCalculated ? "" : String(food.calories),
    memo: food.memo ?? "",
  };
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  statusContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  statusText: { color: colors.textMuted, fontSize: 13, textAlign: "center" },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  closeButtonText: { color: colors.surface, fontWeight: "700" },
});
