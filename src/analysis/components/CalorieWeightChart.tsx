import { Fragment } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import type { AnalysisChartPoint } from "@/analysis/types/analysis";
import { colors } from "@/shared/theme/colors";

const CHART_HEIGHT = 260;
const PADDING = { top: 22, right: 46, bottom: 42, left: 46 };
const Y_AXIS_RATIOS = [0, 0.5, 1] as const;
const CALORIE_COLOR = colors.fat;
const WEIGHT_COLOR = colors.primary;

type CalorieWeightChartProps = {
  points: AnalysisChartPoint[];
  selectedKey: string | null;
  onSelectPoint: (key: string) => void;
};

export function CalorieWeightChart({
  points,
  selectedKey,
  onSelectPoint,
}: CalorieWeightChartProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.max(300, windowWidth - 32);
  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const slotWidth = plotWidth / points.length;
  const calorieMax = getCalorieMax(points);
  const weightRange = getWeightRange(points);
  const weightPolyline = points
    .map((point, index) => {
      if (point.weightKg === null) return null;
      return `${getX(index, slotWidth)},${getWeightY(
        point.weightKg,
        weightRange,
        plotHeight,
      )}`;
    })
    .filter((point): point is string => point !== null)
    .join(" ");
  const selectedPoint = points.find((point) => point.key === selectedKey);

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <Legend color={CALORIE_COLOR} label="摂取カロリー" shape="bar" />
        <Legend color={WEIGHT_COLOR} label="体重" shape="line" />
      </View>

      <Svg height={CHART_HEIGHT} width={width}>
        {Y_AXIS_RATIOS.map((ratio) => {
          const y = PADDING.top + plotHeight * ratio;
          return (
            <Line
              key={ratio}
              stroke={colors.border}
              strokeWidth={1}
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={y}
              y2={y}
            />
          );
        })}

        <SvgText
          fill={CALORIE_COLOR}
          fontSize={9}
          textAnchor="start"
          x={4}
          y={12}
        >
          kcal
        </SvgText>
        <SvgText
          fill={WEIGHT_COLOR}
          fontSize={9}
          textAnchor="end"
          x={width - 4}
          y={12}
        >
          kg
        </SvgText>

        {Y_AXIS_RATIOS.map((ratio) => {
          const y = PADDING.top + plotHeight * ratio + 3;
          const calories = Math.round(calorieMax * (1 - ratio));
          const weight =
            weightRange.max - (weightRange.max - weightRange.min) * ratio;
          return (
            <Fragment key={`labels-${ratio}`}>
              <SvgText
                fill={colors.textMuted}
                fontSize={9}
                textAnchor="end"
                x={PADDING.left - 6}
                y={y}
              >
                {calories.toLocaleString()}
              </SvgText>
              <SvgText
                fill={colors.textMuted}
                fontSize={9}
                textAnchor="start"
                x={width - PADDING.right + 6}
                y={y}
              >
                {weight.toFixed(1)}
              </SvgText>
            </Fragment>
          );
        })}

        {points.map((point, index) => {
          if (point.calories === null) return null;
          const barHeight = (point.calories / calorieMax) * plotHeight;
          const barWidth = Math.max(3, Math.min(slotWidth * 0.58, 18));
          return (
            <Rect
              fill={CALORIE_COLOR}
              key={`calories-${point.key}`}
              opacity={0.72}
              rx={2}
              width={barWidth}
              x={getX(index, slotWidth) - barWidth / 2}
              y={PADDING.top + plotHeight - barHeight}
              height={barHeight}
            />
          );
        })}

        {weightPolyline.includes(" ") && (
          <Polyline
            fill="none"
            points={weightPolyline}
            stroke={WEIGHT_COLOR}
            strokeLinejoin="round"
            strokeWidth={2.5}
          />
        )}

        {points.map((point, index) =>
          point.weightKg === null ? null : (
            <Circle
              cx={getX(index, slotWidth)}
              cy={getWeightY(point.weightKg, weightRange, plotHeight)}
              fill={colors.surface}
              key={`weight-${point.key}`}
              r={3.5}
              stroke={WEIGHT_COLOR}
              strokeWidth={2}
            />
          ),
        )}

        {points.map((point, index) => {
          if (!shouldShowLabel(index, points.length)) return null;
          return (
            <SvgText
              fill={colors.textMuted}
              fontSize={8}
              key={`label-${point.key}`}
              textAnchor="middle"
              x={getX(index, slotWidth)}
              y={CHART_HEIGHT - 16}
            >
              {point.label}
            </SvgText>
          );
        })}

        {selectedPoint && (
          <Line
            stroke={colors.textMuted}
            strokeDasharray="3 3"
            strokeWidth={1}
            x1={getX(points.indexOf(selectedPoint), slotWidth)}
            x2={getX(points.indexOf(selectedPoint), slotWidth)}
            y1={PADDING.top}
            y2={PADDING.top + plotHeight}
          />
        )}

        {points.map((point, index) => (
          <Rect
            accessibilityLabel={`${point.label}の分析値を表示`}
            fill="transparent"
            height={plotHeight}
            key={`target-${point.key}`}
            onPress={() => onSelectPoint(point.key)}
            width={slotWidth}
            x={PADDING.left + index * slotWidth}
            y={PADDING.top}
          />
        ))}
      </Svg>

      {selectedPoint ? (
        <View style={styles.selectedValue}>
          <Text style={styles.selectedDate}>{selectedPoint.label}</Text>
          <Text style={styles.selectedText}>
            摂取カロリー：{formatCalories(selectedPoint.calories)}
          </Text>
          <Text style={styles.selectedText}>
            体重：{formatWeight(selectedPoint.weightKg)}
          </Text>
        </View>
      ) : (
        <Text style={styles.hint}>
          棒または線の日付をタップすると値を確認できます
        </Text>
      )}
    </View>
  );
}

type LegendProps = {
  color: string;
  label: string;
  shape: "bar" | "line";
};

function Legend({ color, label, shape }: LegendProps) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendShape,
          { backgroundColor: color },
          shape === "line" && styles.legendLine,
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function getX(index: number, slotWidth: number): number {
  return PADDING.left + slotWidth * index + slotWidth / 2;
}

function getCalorieMax(points: AnalysisChartPoint[]): number {
  const max = Math.max(...points.map((point) => point.calories ?? 0), 500);
  return Math.ceil(max / 500) * 500;
}

function getWeightRange(points: AnalysisChartPoint[]): {
  min: number;
  max: number;
} {
  const weights = points
    .map((point) => point.weightKg)
    .filter((weight): weight is number => weight !== null);
  if (weights.length === 0) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const padding = Math.max((max - min) * 0.2, 0.5);
  return { min: min - padding, max: max + padding };
}

function getWeightY(
  weight: number,
  range: { min: number; max: number },
  plotHeight: number,
): number {
  const ratio = (weight - range.min) / (range.max - range.min);
  return PADDING.top + plotHeight * (1 - ratio);
}

function shouldShowLabel(index: number, pointCount: number): boolean {
  const interval = pointCount <= 8 ? 1 : pointCount <= 16 ? 2 : 4;
  return index === 0 || index === pointCount - 1 || index % interval === 0;
}

function formatCalories(value: number | null): string {
  return value === null
    ? "未記録"
    : `${Math.round(value).toLocaleString()} kcal`;
}

function formatWeight(value: number | null): string {
  return value === null ? "未記録" : `${value.toFixed(1)} kg`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: 14,
  },
  legend: {
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  legendShape: {
    borderRadius: 2,
    height: 10,
    width: 8,
  },
  legendLine: {
    height: 3,
    width: 14,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  selectedValue: {
    backgroundColor: colors.surfaceMuted,
    gap: 3,
    margin: 12,
    marginTop: 0,
    padding: 12,
    borderRadius: 12,
  },
  selectedDate: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  selectedText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 14,
    textAlign: "center",
  },
});
