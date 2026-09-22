import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FoodCard } from "@/foods/components/FoodCard";
import { FoodSearchInput } from "@/foods/components/FoodSearchInput";
import { filterFoods } from "@/foods/services/filterFoods";
import type { FoodRepository } from "@/foods/storage/FoodRepository";
import type { FoodItem } from "@/foods/types/food";
import { colors } from "@/shared/theme/colors";

const FOOD_CARD_COLORS = [colors.protein, colors.carbs, colors.fat];

type FoodSelectionModalProps = {
  isVisible: boolean;
  repository: FoodRepository;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
};

export function FoodSelectionModal({
  isVisible,
  repository,
  onClose,
  onSelectFood,
}: FoodSelectionModalProps) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let isActive = true;

    const loadFoods = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const loadedFoods = await repository.findAll();
        if (isActive) {
          setFoods(loadedFoods);
        }
      } catch (error) {
        console.error("食品一覧の取得に失敗しました", error);
        if (isActive) {
          setLoadError("食品を読み込めませんでした");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadFoods();

    return () => {
      isActive = false;
    };
  }, [isVisible, repository, retryToken]);

  const filteredFoods = useMemo(
    () => filterFoods(foods, searchText),
    [foods, searchText],
  );

  const handleClose = () => {
    setSearchText("");
    onClose();
  };

  const handleSelectFood = (food: FoodItem) => {
    setSearchText("");
    onSelectFood(food);
  };

  function renderEmptyState() {
    if (isLoading) {
      return <StatusMessage message="食品を読み込んでいます" />;
    }

    if (loadError) {
      return (
        <StatusMessage
          actionLabel="もう一度読み込む"
          message={loadError}
          onAction={() => setRetryToken((current) => current + 1)}
        />
      );
    }

    if (foods.length === 0) {
      return <StatusMessage message="登録した食品はありません" />;
    }

    return <StatusMessage message="該当する食品がありません" />;
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
      visible={isVisible}
    >
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="食品選択を閉じる"
            accessibilityRole="button"
            onPress={handleClose}
            style={styles.headerAction}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.title}>ライブラリから選ぶ</Text>
          <View style={styles.headerAction} />
        </View>

        <FlatList
          contentContainerStyle={styles.listContent}
          data={isLoading || loadError ? [] : filteredFoods}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(food) => food.id}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            <FoodSearchInput onChangeText={setSearchText} value={searchText} />
          }
          renderItem={({ item, index }) => (
            <FoodCard
              accentColor={FOOD_CARD_COLORS[index % FOOD_CARD_COLORS.length]}
              food={item}
              onPress={handleSelectFood}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  );
}

type StatusMessageProps = {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
};

function StatusMessage({ actionLabel, message, onAction }: StatusMessageProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 58,
  },
  headerAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: 64,
  },
  closeText: { color: colors.text, fontSize: 26 },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: "center" },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "800",
  },
});
