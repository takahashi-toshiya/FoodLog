import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MealEntryForm } from "@/meals/components/MealEntryForm";
import type { MealRepository } from "@/meals/storage/MealRepository";
import type { CreateMealEntryInput, MealEntry } from "@/meals/types/meal";
import type { MealInputValues } from "@/meals/types/mealInput";
import { colors } from "@/shared/theme/colors";

type EditMealScreenProps = {
  entryId: string;
  repository: MealRepository;
  onCancel: () => void;
  onDeleted: (date: string) => void;
  onSaved: (date: string) => void;
};

export function EditMealScreen({
  entryId,
  repository,
  onCancel,
  onDeleted,
  onSaved,
}: EditMealScreenProps) {
  const [entry, setEntry] = useState<MealEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadEntry = async () => {
      try {
        const found = await repository.findById(entryId);
        if (!isActive) {
          return;
        }

        setEntry(found);
        setLoadError(found ? null : "編集する食事記録が見つかりませんでした");
      } catch (error) {
        console.error("食事記録の取得に失敗しました", error);
        if (isActive) {
          setLoadError("食事記録を読み込めませんでした");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadEntry();

    return () => {
      isActive = false;
    };
  }, [entryId, repository]);

  const handleSubmit = async (input: CreateMealEntryInput) => {
    await repository.update(entryId, input);
    onSaved(input.date);
  };

  const handleDelete = async () => {
    if (!entry || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await repository.delete(entryId);
      onDeleted(entry.date);
    } catch (error) {
      console.error("食事記録の削除に失敗しました", error);
      setDeleteError("食事記録を削除できませんでした。もう一度お試しください");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestDelete = () => {
    Alert.alert("食事記録を削除しますか？", "この操作は取り消せません", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: handleDelete },
    ]);
  };

  if (isLoading) {
    return <StatusScreen message="食事記録を読み込んでいます" />;
  }

  if (!entry || loadError) {
    return (
      <StatusScreen
        actionLabel="閉じる"
        message={loadError ?? "編集する食事記録が見つかりませんでした"}
        onAction={onCancel}
      />
    );
  }

  return (
    <MealEntryForm
      closeAccessibilityLabel="食事編集を閉じる"
      initialValues={createInitialValues(entry)}
      isDisabled={isDeleting}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      renderFooter={(isSubmitting) => (
        <View style={styles.deleteArea}>
          {deleteError ? (
            <Text style={styles.errorText}>{deleteError}</Text>
          ) : null}
          <Pressable
            accessibilityLabel="食事記録を削除"
            disabled={isSubmitting}
            onPress={handleRequestDelete}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>
              {isDeleting ? "削除しています" : "食事記録を削除"}
            </Text>
          </Pressable>
        </View>
      )}
      submitLabel="変更を保存"
      title="食事を編集"
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
    <SafeAreaView style={styles.statusSafeArea}>
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

function createInitialValues(entry: MealEntry): MealInputValues {
  const multiplier = entry.servingMultiplier;

  return {
    sourceFoodId: entry.sourceFoodId,
    date: entry.date,
    mealType: entry.mealType,
    name: entry.name,
    servingMultiplier: String(multiplier),
    protein: formatInputNumber(entry.protein / multiplier),
    fat: formatInputNumber(entry.fat / multiplier),
    carbs: formatInputNumber(entry.carbs / multiplier),
    calorieSource: entry.calorieSource,
    manualCalories:
      entry.calorieSource === "manual"
        ? String(Math.round(entry.calories / multiplier))
        : "",
    memo: entry.memo ?? "",
  };
}

function formatInputNumber(value: number): string {
  return String(Number(value.toFixed(6)));
}

const styles = StyleSheet.create({
  statusSafeArea: { backgroundColor: colors.background, flex: 1 },
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
  deleteArea: { alignItems: "center", marginTop: 16 },
  deleteButton: { paddingHorizontal: 20, paddingVertical: 14 },
  deleteText: { color: "#C83E3E", fontSize: 13, fontWeight: "700" },
  errorText: { color: "#C83E3E", fontSize: 12, textAlign: "center" },
});
