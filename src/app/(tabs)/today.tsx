import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { TodayScreen } from "@/meals/screens/TodayScreen";
import { SQLiteMealRepository } from "@/meals/storage/SQLiteMealRepository";
import type { MealType } from "@/meals/types/meal";

export default function TodayRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{
    date?: string;
    dateRequestId?: string;
  }>();
  const repository = useMemo(() => new SQLiteMealRepository(db), [db]);
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

  return (
    <TodayScreen
      initialDateKey={params.date}
      initialDateRequestId={params.dateRequestId}
      isFocused={isFocused}
      onAddMeal={handleAddMeal}
      repository={repository}
    />
  );
}
