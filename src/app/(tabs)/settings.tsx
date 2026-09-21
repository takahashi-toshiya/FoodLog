import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { SettingsScreen } from "@/settings/screens/SettingsScreen";
import { SQLiteNutritionGoalRepository } from "@/settings/storage/SQLiteNutritionGoalRepository";

export default function SettingsRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const repository = useMemo(() => new SQLiteNutritionGoalRepository(db), [db]);
  const [refreshToken, setRefreshToken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshToken((current) => current + 1);
    }, []),
  );

  return (
    <SettingsScreen
      onEditGoal={() => router.push("/edit-nutrition-goal")}
      onExportCsv={() => router.push("/export-csv")}
      refreshToken={refreshToken}
      repository={repository}
    />
  );
}
