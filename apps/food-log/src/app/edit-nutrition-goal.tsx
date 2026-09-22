import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { EditNutritionGoalScreen } from "@/settings/screens/EditNutritionGoalScreen";
import { SQLiteNutritionGoalRepository } from "@/settings/storage/SQLiteNutritionGoalRepository";

export default function EditNutritionGoalRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const repository = useMemo(() => new SQLiteNutritionGoalRepository(db), [db]);

  return (
    <EditNutritionGoalScreen
      onCancel={() => router.back()}
      onSaved={() => router.back()}
      repository={repository}
    />
  );
}
