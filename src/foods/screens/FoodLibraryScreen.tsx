import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FoodCard } from "@/foods/components/FoodCard";
import { FoodSearchInput } from "@/foods/components/FoodSearchInput";
import {
  LibraryCategoryTabs,
  type LibraryCategory,
} from "@/foods/components/LibraryCategoryTabs";
import { filterFoods } from "@/foods/services/filterFoods";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodItem } from "@/foods/types/food";
import { colors } from "@/shared/theme/colors";

const CARD_COLORS = [colors.protein, colors.carbs, colors.fat];

type FoodLibraryScreenProps = {
  repository: FoodRepository;
  onAddFood: () => void;
  refreshToken?: number;
};

export function FoodLibraryScreen({
  repository,
  onAddFood,
  refreshToken = 0,
}: FoodLibraryScreenProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<LibraryCategory>("foods");
  const [searchText, setSearchText] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

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

  useEffect(() => {
    void loadFoods();
  }, [loadFoods, refreshToken, retryToken]);

  const filteredFoods = useMemo(
    () => filterFoods(foods, searchText),
    [foods, searchText],
  );
  const isSearching = searchText.trim().length > 0;

  function renderEmptyState() {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>食品を読み込んでいます</Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{loadError}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setRetryToken((current) => current + 1)}
            style={styles.emptyAction}
          >
            <Text style={styles.emptyActionText}>もう一度読み込む</Text>
          </Pressable>
        </View>
      );
    }

    if (selectedCategory === "sets") {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>セットはまだありません</Text>
          <Text style={styles.emptyDescription}>
            セットの登録は今後の機能で追加します。
          </Text>
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

  const visibleFoods = selectedCategory === "foods" ? filteredFoods : [];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>すばやく記録</Text>
            <Text style={styles.title}>ライブラリ</Text>
          </View>
          <Pressable
            accessibilityLabel="食品を追加"
            accessibilityRole="button"
            onPress={onAddFood}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </Pressable>
        </View>

        <FlatList
          contentContainerStyle={styles.listContent}
          data={isLoading || loadError ? [] : visibleFoods}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(food) => food.id}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            <View>
              <LibraryCategoryTabs
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
              <FoodSearchInput
                onChangeText={setSearchText}
                value={searchText}
              />
              <Text style={styles.hint}>
                項目を選ぶと、内容を確認して今日の食事に追加できます。
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FoodCard
              accentColor={CARD_COLORS[index % CARD_COLORS.length]}
              food={item}
            />
          )}
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
