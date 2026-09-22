import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { SQLiteMealRepository } from "@/meals/storage/SQLiteMealRepository";
import type { MealType } from "@/meals/types/meal";
import { SQLiteNutritionGoalRepository } from "@/settings/storage/SQLiteNutritionGoalRepository";
import { TodayScreen } from "@/today/screens/TodayScreen";
import { SQLiteWeightRepository } from "@/weights/storage/SQLiteWeightRepository";

export default function TodayRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{
    date?: string;
    dateRequestId?: string;
  }>();
  const repository = useMemo(() => new SQLiteMealRepository(db), [db]);
  const nutritionGoalRepository = useMemo(
    () => new SQLiteNutritionGoalRepository(db),
    [db],
  );
  const weightRepository = useMemo(() => new SQLiteWeightRepository(db), [db]);
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const handleAddMeal = (date: string, mealType?: MealType) => {
    router.push({
      pathname: "/add-meal",
      params: { date, mealType: mealType ?? "breakfast" },
    });
  };

  const handleEditMeal = (entryId: string) => {
    router.push({ pathname: "/edit-meal", params: { entryId } });
  };

  return (
    <TodayScreen
      initialDateKey={params.date}
      initialDateRequestId={params.dateRequestId}
      isFocused={isFocused}
      onAddMeal={handleAddMeal}
      onEditMeal={handleEditMeal}
      nutritionGoalRepository={nutritionGoalRepository}
      repository={repository}
      weightRepository={weightRepository}
    />
  );
}
