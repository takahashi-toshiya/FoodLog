import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { EditMealScreen } from "@/meals/screens/EditMealScreen";
import { SQLiteMealRepository } from "@/meals/storage/SQLiteMealRepository";

export default function EditMealRoute() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams<{ entryId?: string }>();
  const repository = useMemo(() => new SQLiteMealRepository(db), [db]);
  const returnToToday = (date: string) => {
    router.replace({
      pathname: "/today",
      params: { date, dateRequestId: String(Date.now()) },
    });
  };

  return (
    <EditMealScreen
      entryId={params.entryId ?? ""}
      onCancel={() => router.back()}
      onDeleted={returnToToday}
      onSaved={returnToToday}
      repository={repository}
    />
  );
}
