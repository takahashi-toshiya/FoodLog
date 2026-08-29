import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import {
  calculateProgress,
  calculateRemaining,
} from "@/meals/services/nutrition";
import type { NutritionGoal, NutritionValues } from "@/meals/types/nutrition";
import { colors } from "@/shared/theme/colors";

type DailyNutritionSummaryProps = {
  totals: NutritionValues;
  goal: NutritionGoal;
};

type MacroProgressRowProps = {
  label: string;
  shortLabel: string;
  current: number;
  goal: number;
  color: string;
};

const RING_SIZE = 112;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function MacroProgressRow({
  label,
  shortLabel,
  current,
  goal,
  color,
}: MacroProgressRowProps) {
  const progress = calculateProgress(current, goal);

  return (
    <View style={styles.macroRow}>
      <View style={[styles.macroBadge, { backgroundColor: color }]}>
        <Text style={styles.macroBadgeText}>{shortLabel}</Text>
      </View>
      <View style={styles.macroContent}>
        <View style={styles.macroLabels}>
          <Text style={styles.macroName}>{label}</Text>
          <Text style={styles.macroValue}>
            {current}
            <Text style={styles.macroGoal}> / {goal}g</Text>
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: color, width: `${progress * 100}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export function DailyNutritionSummary({
  totals,
  goal,
}: DailyNutritionSummaryProps) {
  const calorieProgress = calculateProgress(totals.calories, goal.calories);
  const strokeOffset = RING_CIRCUMFERENCE * (1 - calorieProgress);
  const remainingCalories = calculateRemaining(totals.calories, goal.calories);

  return (
    <View style={styles.card}>
      <View style={styles.summaryRow}>
        <View
          accessibilityLabel={`摂取カロリー ${totals.calories}、目標 ${goal.calories}`}
          style={styles.ringWrap}
        >
          <Svg height={RING_SIZE} width={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              fill="none"
              r={RING_RADIUS}
              stroke={colors.progressTrack}
              strokeWidth={RING_STROKE}
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              fill="none"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              r={RING_RADIUS}
              rotation="-90"
              stroke={colors.primary}
              strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              strokeWidth={RING_STROKE}
            />
          </Svg>
          <View pointerEvents="none" style={styles.ringLabel}>
            <Text style={styles.calorieValue}>
              {totals.calories.toLocaleString()}
            </Text>
            <Text style={styles.calorieGoal}>
              / {goal.calories.toLocaleString()} kcal
            </Text>
          </View>
        </View>

        <View style={styles.remaining}>
          <Text style={styles.remainingLabel}>今日の残り</Text>
          <Text style={styles.remainingValue}>
            {remainingCalories.toLocaleString()}
            <Text style={styles.remainingUnit}> kcal</Text>
          </Text>
          <Text style={styles.paceLabel}>
            {remainingCalories > 0 ? "いいペースです" : "目標に到達しました"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.macros}>
        <MacroProgressRow
          color={colors.protein}
          current={totals.protein}
          goal={goal.protein}
          label="たんぱく質"
          shortLabel="P"
        />
        <MacroProgressRow
          color={colors.fat}
          current={totals.fat}
          goal={goal.fat}
          label="脂質"
          shortLabel="F"
        />
        <MacroProgressRow
          color={colors.carbs}
          current={totals.carbs}
          goal={goal.carbs}
          label="炭水化物"
          shortLabel="C"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 17,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  ringWrap: {
    height: RING_SIZE,
    width: RING_SIZE,
  },
  ringLabel: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  calorieValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  calorieGoal: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  remaining: {
    flex: 1,
  },
  remainingLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  remainingValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginVertical: 5,
  },
  remainingUnit: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "400",
  },
  paceLabel: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: 9,
    color: colors.primary,
    fontSize: 11,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  macros: {
    gap: 10,
  },
  macroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  macroBadge: {
    alignItems: "center",
    borderRadius: 6,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  macroBadgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "800",
  },
  macroContent: {
    flex: 1,
  },
  macroLabels: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroName: {
    color: colors.textMuted,
    fontSize: 11,
  },
  macroValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  macroGoal: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  progressTrack: {
    backgroundColor: colors.progressTrack,
    borderRadius: 5,
    height: 5,
    marginTop: 5,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 5,
    height: "100%",
  },
});
