import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NutritionGoalRepository } from "@/settings/storage/NutritionGoalRepository";
import type { NutritionGoal } from "@/settings/types/nutritionGoal";
import { colors } from "@/shared/theme/colors";
import { toDateKey } from "@/shared/utils/date";

type SettingsScreenProps = {
  repository: NutritionGoalRepository;
  refreshToken?: number;
  onEditGoal: () => void;
};

const GOAL_ROWS = [
  { key: "calories", label: "カロリー", unit: "kcal" },
  { key: "protein", label: "たんぱく質", unit: "g" },
  { key: "fat", label: "脂質", unit: "g" },
  { key: "carbs", label: "炭水化物", unit: "g" },
] as const;

export function SettingsScreen({
  repository,
  refreshToken,
  onEditGoal,
}: SettingsScreenProps) {
  const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadGoal = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setGoal(await repository.findEffectiveOn(toDateKey(new Date())));
    } catch (error) {
      console.error("栄養目標の取得に失敗しました", error);
      setLoadError("目標値を読み込めませんでした");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void loadGoal();
  }, [loadGoal, refreshToken]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>あなたの基準</Text>
          <Text style={styles.title}>設定</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>1日の目標</Text>
          <View style={styles.card}>
            {isLoading ? (
              <Text style={styles.statusText}>目標値を読み込んでいます</Text>
            ) : loadError ? (
              <View style={styles.errorState}>
                <Text style={styles.statusText}>{loadError}</Text>
                <Pressable onPress={loadGoal}>
                  <Text style={styles.retryText}>再試行</Text>
                </Pressable>
              </View>
            ) : (
              goal && (
                <>
                  {GOAL_ROWS.map(({ key, label, unit }) => (
                    <View key={key} style={styles.goalRow}>
                      <Text style={styles.goalLabel}>{label}</Text>
                      <Text style={styles.goalValue}>
                        {goal[key].toLocaleString()} {unit}
                      </Text>
                    </View>
                  ))}
                  <Pressable
                    accessibilityLabel="目標を編集"
                    onPress={onEditGoal}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>目標を編集</Text>
                  </Pressable>
                </>
              )
            )}
          </View>

          <Text style={styles.sectionTitle}>データ</Text>
          <View accessibilityLabel="CSV書き出しは準備中" style={styles.navCard}>
            <Text style={styles.navIcon}>⇩</Text>
            <View style={styles.navContent}>
              <Text style={styles.navTitle}>CSVを書き出す</Text>
              <Text style={styles.navDescription}>
                期間を選んで食事明細を保存（準備中）
              </Text>
            </View>
            <Text style={styles.navArrow}>›</Text>
          </View>

          <Text style={styles.privacyText}>
            データは端末内に保存し、外部へ自動送信しません。
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  screen: { flex: 1 },
  header: { minHeight: 90, paddingHorizontal: 20, paddingVertical: 16 },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  title: { color: colors.text, fontSize: 23, fontWeight: "800" },
  content: { paddingBottom: 32, paddingHorizontal: 16 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
    marginHorizontal: 4,
    marginTop: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1,
    overflow: "hidden",
  },
  goalRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  goalLabel: { color: colors.text, fontSize: 12 },
  goalValue: { color: colors.text, fontSize: 12, fontWeight: "800" },
  editButton: { alignItems: "center", minHeight: 44, justifyContent: "center" },
  editButtonText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  statusText: { color: colors.textMuted, padding: 20, textAlign: "center" },
  errorState: { alignItems: "center", paddingBottom: 16 },
  retryText: { color: colors.primary, fontWeight: "700" },
  navCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  navIcon: { color: colors.primary, fontSize: 22, width: 32 },
  navContent: { flex: 1 },
  navTitle: { color: colors.text, fontSize: 12, fontWeight: "800" },
  navDescription: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  navArrow: { color: colors.textMuted },
  privacyText: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 14,
    padding: 12,
  },
});
