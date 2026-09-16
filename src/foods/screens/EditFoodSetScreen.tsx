import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FoodSetForm } from "@/foods/components/FoodSetForm";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodSet } from "@/foods/types/foodSet";
import type { FoodSetInputValues } from "@/foods/types/foodSetInput";
import { colors } from "@/shared/theme/colors";

type EditFoodSetScreenProps = {
  foodRepository: FoodRepository;
  foodSetId: string;
  foodSetRepository: FoodSetRepository;
  onCancel: () => void;
  onSaved: () => void;
};

export function EditFoodSetScreen({
  foodRepository,
  foodSetId,
  foodSetRepository,
  onCancel,
  onSaved,
}: EditFoodSetScreenProps) {
  const [foodSet, setFoodSet] = useState<FoodSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadFoodSet = async () => {
      try {
        const found = await foodSetRepository.findById(foodSetId);
        if (!isActive) {
          return;
        }

        setFoodSet(found);
        setLoadError(found ? null : "編集する食品セットが見つかりませんでした");
      } catch (error) {
        console.error("食品セットの取得に失敗しました", error);
        if (isActive) {
          setLoadError("食品セットを読み込めませんでした");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadFoodSet();

    return () => {
      isActive = false;
    };
  }, [foodSetId, foodSetRepository]);

  if (isLoading) {
    return <StatusScreen message="食品セットを読み込んでいます" />;
  }

  if (!foodSet || loadError) {
    return (
      <StatusScreen
        actionLabel="閉じる"
        message={loadError ?? "編集する食品セットが見つかりませんでした"}
        onAction={onCancel}
      />
    );
  }

  return (
    <FoodSetForm
      closeAccessibilityLabel="食品セット編集を閉じる"
      foodRepository={foodRepository}
      initialValues={createInitialValues(foodSet)}
      onCancel={onCancel}
      onSubmit={async (input) => {
        await foodSetRepository.update(foodSetId, input);
        onSaved();
      }}
      submitLabel="セットの変更を保存"
      title="食品セットを編集"
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

function createInitialValues(foodSet: FoodSet): FoodSetInputValues {
  return {
    name: foodSet.name,
    items: foodSet.items.map((item) => ({
      food: item.food,
      servingMultiplier: String(item.servingMultiplier),
    })),
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
