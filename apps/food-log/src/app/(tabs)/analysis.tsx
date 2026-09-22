import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { AnalysisScreen } from "@/analysis/screens/AnalysisScreen";
import { SQLiteAnalysisRepository } from "@/analysis/storage/SQLiteAnalysisRepository";

export default function AnalysisRoute() {
  const db = useSQLiteContext();
  const repository = useMemo(() => new SQLiteAnalysisRepository(db), [db]);
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  return <AnalysisScreen isFocused={isFocused} repository={repository} />;
}
