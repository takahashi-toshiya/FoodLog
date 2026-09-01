import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { TodayScreen } from "@/meals/screens/TodayScreen";
import { SQLiteMealRepository } from "@/meals/storage/SQLiteMealRepository";
import type { MealType } from "@/meals/types/meal";

export default function TodayRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const repository = useMemo(() => new SQLiteMealRepository(db), [db]);
  const [refreshToken, setRefreshToken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshToken((current) => current + 1);
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
      onAddMeal={handleAddMeal}
      refreshToken={refreshToken}
      repository={repository}
    />
  );
}
