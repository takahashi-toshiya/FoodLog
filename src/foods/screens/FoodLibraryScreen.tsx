import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FoodCard } from "@/foods/components/FoodCard";
import { FoodSearchInput } from "@/foods/components/FoodSearchInput";
import { FoodSetCard } from "@/foods/components/FoodSetCard";
import {
  LibraryCategoryTabs,
  type LibraryCategory,
} from "@/foods/components/LibraryCategoryTabs";
import { filterFoods } from "@/foods/services/filterFoods";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodSetRepository } from "@/foods/storage/FoodSetRepository";
import type { FoodItem } from "@/foods/types/food";
import type { FoodSet } from "@/foods/types/foodSet";
import { colors } from "@/shared/theme/colors";

const CARD_COLORS = [colors.protein, colors.carbs, colors.fat];

type FoodLibraryScreenProps = {
  foodSetRepository: FoodSetRepository;
  repository: FoodRepository;
  onAddFood: () => void;
  onAddFoodSet: () => void;
  onEditFood: (foodId: string) => void;
  onEditFoodSet: (foodSetId: string) => void;
  onSelectFood: (food: FoodItem) => void;
  onSelectFoodSet: (foodSet: FoodSet) => void;
  refreshToken?: number;
};

type LibraryListItem =
  { kind: "food"; value: FoodItem } | { kind: "foodSet"; value: FoodSet };

export function FoodLibraryScreen({
  foodSetRepository,
  repository,
  onAddFood,
  onAddFoodSet,
  onEditFood,
  onEditFoodSet,
  onSelectFood,
  onSelectFoodSet,
  refreshToken = 0,
}: FoodLibraryScreenProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<LibraryCategory>("foods");
  const [searchText, setSearchText] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodSets, setFoodSets] = useState<FoodSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFoodSetLoading, setIsFoodSetLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [foodSetLoadError, setFoodSetLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [foodSetRetryToken, setFoodSetRetryToken] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null);
  const [deletingFoodSetId, setDeletingFoodSetId] = useState<string | null>(
    null,
  );

  const loadFoods = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setFoods(await repository.findAll());
    } catch (error) {
      console.error("食品一覧の取得に失敗しました", error);
      setLoadError("食品を読み込めませんでした");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const loadFoodSets = useCallback(async () => {
    setIsFoodSetLoading(true);
    setFoodSetLoadError(null);

    try {
      setFoodSets(await foodSetRepository.findAll());
    } catch (error) {
      console.error("食品セット一覧の取得に失敗しました", error);
      setFoodSetLoadError("食品セットを読み込めませんでした");
    } finally {
      setIsFoodSetLoading(false);
    }
  }, [foodSetRepository]);

  useEffect(() => {
    void loadFoods();
  }, [loadFoods, refreshToken, retryToken]);

  useEffect(() => {
    void loadFoodSets();
  }, [foodSetRetryToken, loadFoodSets, refreshToken]);

  const filteredFoods = useMemo(
    () => filterFoods(foods, searchText),
    [foods, searchText],
  );
  const isSearching = searchText.trim().length > 0;

  function renderEmptyState() {
    const isCurrentLoading =
      selectedCategory === "foods" ? isLoading : isFoodSetLoading;
    const currentLoadError =
      selectedCategory === "foods" ? loadError : foodSetLoadError;

    if (isCurrentLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {selectedCategory === "foods"
              ? "食品を読み込んでいます"
              : "食品セットを読み込んでいます"}
          </Text>
        </View>
      );
    }

    if (currentLoadError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{currentLoadError}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (selectedCategory === "foods") {
                setRetryToken((current) => current + 1);
              } else {
                setFoodSetRetryToken((current) => current + 1);
              }
            }}
            style={styles.emptyAction}
          >
            <Text style={styles.emptyActionText}>もう一度読み込む</Text>
          </Pressable>
        </View>
      );
    }

    if (selectedCategory === "sets") {
      if (foodSets.length > 0) {
        return null;
      }

      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>セットはまだありません</Text>
          <Text style={styles.emptyDescription}>
            よく使う食品をまとめて、すばやく記録できます。
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onAddFoodSet}
            style={styles.emptyAction}
          >
            <Text style={styles.emptyActionText}>＋ セットを追加</Text>
          </Pressable>
        </View>
      );
    }

    if (foods.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>登録した食品はありません</Text>
          <Text style={styles.emptyDescription}>
            よく使う食品を登録すると、ここに表示されます。
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onAddFood}
            style={styles.emptyAction}
          >
            <Text style={styles.emptyActionText}>＋ 食品を追加</Text>
          </Pressable>
        </View>
      );
    }

    if (isSearching) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>該当する食品がありません</Text>
          <Text style={styles.emptyDescription}>
            別の食品名で検索してください。
          </Text>
        </View>
      );
    }

    return null;
  }

  const visibleItems = useMemo<LibraryListItem[]>(
    () =>
      selectedCategory === "foods"
        ? filteredFoods.map((food) => ({ kind: "food", value: food }))
        : foodSets.map((foodSet) => ({ kind: "foodSet", value: foodSet })),
    [filteredFoods, foodSets, selectedCategory],
  );

  const handleDeleteFood = async (food: FoodItem) => {
    if (deletingFoodId) {
      return;
    }

    setDeletingFoodId(food.id);
    setActionError(null);

    try {
      if (await foodSetRepository.isFoodUsed(food.id)) {
        setActionError(
          "この食品はセットで使用中です。セットから外してから削除してください",
        );
        return;
      }

      await repository.delete(food.id);
      await loadFoods();
    } catch (error) {
      console.error("食品の削除に失敗しました", error);
      setActionError("食品を削除できませんでした。もう一度お試しください");
    } finally {
      setDeletingFoodId(null);
    }
  };

  const handleDeleteFoodSet = async (foodSet: FoodSet) => {
    if (deletingFoodSetId) {
      return;
    }

    setDeletingFoodSetId(foodSet.id);
    setActionError(null);

    try {
      await foodSetRepository.delete(foodSet.id);
      await loadFoodSets();
    } catch (error) {
      console.error("食品セットの削除に失敗しました", error);
      setActionError(
        "食品セットを削除できませんでした。もう一度お試しください",
      );
    } finally {
      setDeletingFoodSetId(null);
    }
  };

  const handleRequestDelete = (food: FoodItem) => {
    Alert.alert(
      `「${food.name}」を削除しますか？`,
      "過去の食事記録は削除されません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: () => handleDeleteFood(food),
        },
      ],
    );
  };

  const handleOpenMenu = (food: FoodItem) => {
    Alert.alert(food.name, "この食品の操作を選択してください", [
      { text: "編集", onPress: () => onEditFood(food.id) },
      {
        text: "削除",
        style: "destructive",
        onPress: () => handleRequestDelete(food),
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  const handleRequestDeleteFoodSet = (foodSet: FoodSet) => {
    Alert.alert(`「${foodSet.name}」を削除しますか？`, undefined, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => handleDeleteFoodSet(foodSet),
      },
    ]);
  };

  const handleOpenFoodSetMenu = (foodSet: FoodSet) => {
    Alert.alert(foodSet.name, "このセットの操作を選択してください", [
      { text: "編集", onPress: () => onEditFoodSet(foodSet.id) },
      {
        text: "削除",
        style: "destructive",
        onPress: () => handleRequestDeleteFoodSet(foodSet),
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  };

  const isCurrentLoading =
    selectedCategory === "foods" ? isLoading : isFoodSetLoading;
  const currentLoadError =
    selectedCategory === "foods" ? loadError : foodSetLoadError;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>すばやく記録</Text>
            <Text style={styles.title}>ライブラリ</Text>
          </View>
          <Pressable
            accessibilityLabel={
              selectedCategory === "foods" ? "食品を追加" : "セットを追加"
            }
            accessibilityRole="button"
            onPress={selectedCategory === "foods" ? onAddFood : onAddFoodSet}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </Pressable>
        </View>

        <FlatList
          contentContainerStyle={styles.listContent}
          data={isCurrentLoading || currentLoadError ? [] : visibleItems}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => `${item.kind}-${item.value.id}`}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            <View>
              <LibraryCategoryTabs
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
              {selectedCategory === "foods" ? (
                <FoodSearchInput
                  onChangeText={setSearchText}
                  value={searchText}
                />
              ) : null}
              <Text style={styles.hint}>
                {selectedCategory === "foods"
                  ? "項目を選ぶと、内容を確認して今日の食事に追加できます。"
                  : "セットを選ぶと、追加先を確認して食事に追加できます。"}
              </Text>
              {actionError ? (
                <Text style={styles.actionError}>{actionError}</Text>
              ) : null}
            </View>
          }
          renderItem={({ item, index }) =>
            item.kind === "food" ? (
              <FoodCard
                accentColor={CARD_COLORS[index % CARD_COLORS.length]}
                food={item.value}
                onPress={onSelectFood}
                onPressMenu={handleOpenMenu}
              />
            ) : (
              <FoodSetCard
                foodSet={item.value}
                onPress={onSelectFoodSet}
                onPressMenu={handleOpenFoodSetMenu}
              />
            )
          }
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 90,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 24,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 18,
    marginHorizontal: 3,
    marginVertical: 12,
  },
  actionError: {
    color: "#C83E3E",
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 220,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    textAlign: "center",
  },
  emptyAction: {
    backgroundColor: colors.primary,
    borderRadius: 13,
    marginTop: 18,
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyActionText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
});
