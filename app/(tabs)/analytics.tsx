import { Ionicons } from "@expo/vector-icons";
import { addMonths, format, subMonths } from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";

import { LoadingView } from "@/components/loading-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { aggregationService } from "@/services/aggregation.service";
import { AggregationData, CategoryAggregation } from "@/types/api.types";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 160;

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { user } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthAgg, setMonthAgg] = useState<AggregationData | null>(null);
  const [catAgg, setCatAgg] = useState<CategoryAggregation[]>([]);
  const [trend, setTrend] = useState<AggregationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currency = user?.currency ?? "USD";

  const fmt = (d: Date) => format(d, "yyyy-MM");

  const load = useCallback(async () => {
    const monthStr = fmt(selectedMonth);
    const endMonth = monthStr;
    const startMonth = fmt(subMonths(selectedMonth, 5));
    try {
      const [m, cats, t] = await Promise.all([
        aggregationService.getMonthly(monthStr).catch(() => null),
        aggregationService.getCategoryMonthly(monthStr).catch(() => []),
        aggregationService
          .getMonthlyRange(startMonth, endMonth)
          .catch(() => []),
      ]);
      setMonthAgg(m);
      setCatAgg(cats);
      setTrend(t);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    load();
  }, [load]);

  const totalExpense = monthAgg?.expense ?? 0;
  const totalIncome = monthAgg?.income ?? 0;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  if (loading) return <LoadingView fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={C.tint}
          />
        }
      >
        {/* Header + Month selector */}
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Analytics</Text>
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() => setSelectedMonth((d) => subMonths(d, 1))}
              style={styles.navBtn}
            >
              <Ionicons name="chevron-back" size={18} color={C.tint} />
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: C.text }]}>
              {format(selectedMonth, "MMMM yyyy")}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedMonth((d) => addMonths(d, 1))}
              disabled={
                format(selectedMonth, "yyyy-MM") >=
                format(new Date(), "yyyy-MM")
              }
              style={styles.navBtn}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={
                  format(selectedMonth, "yyyy-MM") >=
                  format(new Date(), "yyyy-MM")
                    ? C.border
                    : C.tint
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* Summary row */}
          <View style={styles.summaryRow}>
            {(
              [
                {
                  label: "Income",
                  value: monthAgg?.income ?? 0,
                  color: C.income,
                },
                {
                  label: "Expense",
                  value: monthAgg?.expense ?? 0,
                  color: C.expense,
                },
                {
                  label: "Savings",
                  value: monthAgg?.saving ?? 0,
                  color: C.savings,
                },
                {
                  label: "Investment",
                  value: monthAgg?.investment ?? 0,
                  color: C.investment,
                },
              ] as const
            ).map((item) => (
              <View
                key={item.label}
                style={[styles.summaryItem, { backgroundColor: C.surface }]}
              >
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={[styles.summaryItemValue, { color: C.text }]}>
                  {item.value.toLocaleString("en-US", {
                    style: "currency",
                    currency,
                    maximumFractionDigits: 0,
                  })}
                </Text>
                <Text
                  style={[styles.summaryItemLabel, { color: C.textSecondary }]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Savings rate */}
          <View style={[styles.card, { backgroundColor: C.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: C.text }]}>
                Savings Rate
              </Text>
              <Text
                style={[
                  {
                    color: savingsRate >= 20 ? C.income : C.expense,
                    fontWeight: "700",
                    fontSize: 16,
                  },
                ]}
              >
                {savingsRate.toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: C.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(savingsRate, 100)}%`,
                    backgroundColor: savingsRate >= 20 ? C.income : C.expense,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressHint, { color: C.textSecondary }]}>
              {savingsRate >= 20
                ? "🎉 Great savings rate!"
                : "Aim for 20%+ savings rate"}
            </Text>
          </View>

          {/* 6-month trend chart */}
          {trend.length > 0 && (
            <View style={[styles.card, { backgroundColor: C.surface }]}>
              <Text style={[styles.cardTitle, { color: C.text }]}>
                6-Month Trend
              </Text>
              <BarChart data={trend} colorScheme={colorScheme} />
            </View>
          )}

          {/* Category breakdown */}
          {catAgg.length > 0 && (
            <View style={[styles.card, { backgroundColor: C.surface }]}>
              <Text style={[styles.cardTitle, { color: C.text }]}>
                Category Breakdown
              </Text>
              {catAgg.slice(0, 8).map((cat) => (
                <View key={cat.categoryId} style={styles.catRow}>
                  <View style={styles.catLeft}>
                    <Text style={styles.catIcon}>
                      {cat.categoryIcon ?? "📁"}
                    </Text>
                    <View style={styles.catInfo}>
                      <Text style={[styles.catName, { color: C.text }]}>
                        {cat.categoryName}
                      </Text>
                      <Text
                        style={[styles.catCount, { color: C.textSecondary }]}
                      >
                        {cat.transactionCount} transactions
                      </Text>
                    </View>
                  </View>
                  <View style={styles.catRight}>
                    <Text style={[styles.catAmount, { color: C.text }]}>
                      {cat.total.toLocaleString("en-US", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                    <Text style={[styles.catPct, { color: C.textSecondary }]}>
                      {cat.percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View
                    style={[styles.catBarTrack, { backgroundColor: C.border }]}
                  >
                    <View
                      style={[
                        styles.catBarFill,
                        {
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.categoryColor ?? C.tint,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Custom Bar Chart ─────────────────────────────────────────────────────────
function BarChart({
  data,
  colorScheme,
}: {
  data: AggregationData[];
  colorScheme: "light" | "dark";
}) {
  const C = Colors[colorScheme];
  const pad = { left: 40, right: 10, top: 16, bottom: 28 };
  const chartW = CHART_WIDTH - pad.left - pad.right;
  const chartH = CHART_HEIGHT - pad.top - pad.bottom;
  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const barW = Math.floor(chartW / data.length / 2.2);
  const step = chartW / data.length;

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <G x={pad.left} y={pad.top}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((r, i) => (
          <Line
            key={i}
            x1={0}
            y1={chartH * (1 - r)}
            x2={chartW}
            y2={chartH * (1 - r)}
            stroke={C.border}
            strokeWidth={1}
          />
        ))}

        {data.map((d, i) => {
          const x = i * step;
          const iH = (d.income / maxVal) * chartH;
          const eH = (d.expense / maxVal) * chartH;
          const label = format(new Date(d.period + "-01"), "MMM");

          return (
            <G key={d.period}>
              {/* Income bar */}
              <Rect
                x={x + step / 2 - barW - 2}
                y={chartH - iH}
                width={barW}
                height={iH}
                fill={C.income}
                rx={3}
              />
              {/* Expense bar */}
              <Rect
                x={x + step / 2 + 2}
                y={chartH - eH}
                width={barW}
                height={eH}
                fill={C.expense}
                rx={3}
              />
              {/* Label */}
              <SvgText
                x={x + step / 2}
                y={chartH + 18}
                textAnchor="middle"
                fontSize={10}
                fill={C.textSecondary}
              >
                {label}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  monthNav: { flexDirection: "row", alignItems: "center", gap: 8 },
  navBtn: { padding: 4 },
  monthLabel: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 110,
    textAlign: "center",
  },
  body: { padding: 16 },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  summaryItem: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  summaryItemValue: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  summaryItemLabel: { fontSize: 10, fontWeight: "500", marginTop: 2 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: 8, borderRadius: 4 },
  progressHint: { fontSize: 12 },
  catRow: { marginBottom: 16 },
  catLeft: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  catIcon: { fontSize: 20, width: 32 },
  catInfo: { flex: 1 },
  catName: { fontSize: 14, fontWeight: "600" },
  catCount: { fontSize: 11, marginTop: 1 },
  catRight: { position: "absolute", right: 0, top: 0, alignItems: "flex-end" },
  catAmount: { fontSize: 14, fontWeight: "700" },
  catPct: { fontSize: 11 },
  catBarTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  catBarFill: { height: 4, borderRadius: 2 },
});
