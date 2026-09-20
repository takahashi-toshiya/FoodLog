import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnalysisPeriodSelector } from "@/analysis/components/AnalysisPeriodSelector";
import { AnalysisSummary } from "@/analysis/components/AnalysisSummary";
import { CalorieWeightChart } from "@/analysis/components/CalorieWeightChart";
import {
  buildAnalysisReport,
  getAnalysisDateRange,
} from "@/analysis/services/dailyAnalysis";
import type { AnalysisRepository } from "@/analysis/storage/AnalysisRepository";
import type {
  AnalysisPeriodWeeks,
  AnalysisReport,
} from "@/analysis/types/analysis";
import { colors } from "@/shared/theme/colors";
import { toDateKey } from "@/shared/utils/date";

type AnalysisScreenProps = {
  repository: AnalysisRepository;
  endDateKey?: string;
  isFocused?: boolean;
};

export function AnalysisScreen({
  repository,
  endDateKey = toDateKey(new Date()),
  isFocused = true,
}: AnalysisScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalysisPeriodWeeks>(4);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [selectedPointKey, setSelectedPointKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadRequestId = useRef(0);

  const loadAnalysis = useCallback(async () => {
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;
    setIsLoading(true);
    setLoadError(null);

    try {
      const range = getAnalysisDateRange(endDateKey, selectedPeriod);
      const source = await repository.findByDateRange(
        range.startDate,
        range.endDate,
      );
      if (loadRequestId.current === requestId) {
        setReport(buildAnalysisReport(source, selectedPeriod, endDateKey));
        setSelectedPointKey(null);
      }
    } catch (error) {
      console.error("分析データの取得に失敗しました", error);
      if (loadRequestId.current === requestId) {
        setLoadError("分析データを読み込めませんでした");
        setReport(null);
      }
    } finally {
      if (loadRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [endDateKey, repository, selectedPeriod]);

  useEffect(() => {
    if (isFocused) {
      void loadAnalysis();
    }
  }, [isFocused, loadAnalysis]);

  const handleSelectPeriod = (period: AnalysisPeriodWeeks) => {
    setIsLoading(true);
    setSelectedPeriod(period);
    setReport(null);
    setSelectedPointKey(null);
  };

  const hasData =
    report !== null &&
    (report.summary.mealRecordedDays > 0 ||
      report.summary.weightRecordedDays > 0);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>食事と体重</Text>
        <Text style={styles.title}>分析</Text>
      </View>

      <View style={styles.periodContainer}>
        <AnalysisPeriodSelector
          onSelectPeriod={handleSelectPeriod}
          selectedPeriod={selectedPeriod}
        />
      </View>

      {isLoading ? (
        <StatusText>分析データを読み込んでいます</StatusText>
      ) : loadError ? (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            accessibilityLabel="分析データを再読み込み"
            onPress={loadAnalysis}
          >
            <Text style={styles.retryText}>再試行</Text>
          </Pressable>
        </View>
      ) : !hasData || !report ? (
        <View style={styles.statusContainer}>
          <Text style={styles.emptyTitle}>分析できる記録がありません</Text>
          <Text style={styles.statusText}>
            食事または体重を記録すると、ここに推移が表示されます
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <AnalysisSummary summary={report.summary} />
          <CalorieWeightChart
            onSelectPoint={setSelectedPointKey}
            points={report.points}
            selectedKey={selectedPointKey}
          />
          <Text style={styles.estimateNote}>
            推定消費カロリーは食事量と体重変化から算出した目安です。水分などによる体重変動を含みます。
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

type StatusTextProps = {
  children: string;
};

function StatusText({ children }: StatusTextProps) {
  return (
    <View style={styles.statusContainer}>
      <Text style={styles.statusText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 14,
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
    fontSize: 26,
    fontWeight: "800",
  },
  periodContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  content: {
    gap: 14,
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  statusContainer: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  retryText: {
    color: colors.primary,
    fontWeight: "800",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  estimateNote: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
});
