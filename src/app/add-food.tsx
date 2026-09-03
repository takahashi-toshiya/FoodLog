import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { AddFoodScreen } from "@/foods/screens/AddFoodScreen";
import { SQLiteFoodRepository } from "@/foods/storage/SQLiteFoodRepository";

export default function AddFoodRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const repository = useMemo(() => new SQLiteFoodRepository(db), [db]);

  return (
    <AddFoodScreen
      onCancel={() => router.back()}
      onSaved={() => router.back()}
      repository={repository}
    />
  );
}
