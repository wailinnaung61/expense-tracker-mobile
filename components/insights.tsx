import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { Colors } from "@/constants/theme";

const { width } = Dimensions.get("window");

interface SpendingTrendProps {
  monthlyData: { month: string; amount: number }[];
  colorScheme: "light" | "dark";
  currency: string;
}

export function SpendingTrend({
  monthlyData,
  colorScheme,
  currency,
}: SpendingTrendProps) {
  const C = Colors[colorScheme];

  if (monthlyData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: C.surface }]}>
        <Text style={[styles.title, { color: C.text }]}>Spending Trend</Text>
        <View style={styles.empty}>
          <Ionicons name="trending-up" size={32} color={C.textSecondary} />
          <Text style={[styles.emptyText, { color: C.textSecondary }]}>
            Not enough data yet
          </Text>
        </View>
      </View>
    );
  }

  const labels = monthlyData.slice(-6).map((d) => d.month.slice(0, 3));
  const data = monthlyData.slice(-6).map((d) => d.amount);
  const average = data.reduce((a, b) => a + b, 0) / data.length;
  const lastMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2] || lastMonth;
  const change = ((lastMonth - prevMonth) / prevMonth) * 100;
  const isIncreasing = change > 0;
  const isStable = Math.abs(change) < 5;

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: C.text }]}>Spending Trend</Text>
        <View style={styles.badge}>
          <Ionicons
            name={
              isStable
                ? "remove"
                : isIncreasing
                  ? "trending-up"
                  : "trending-down"
            }
            size={14}
            color={isStable ? "#F59E0B" : isIncreasing ? "#EF4444" : "#22C55E"}
          />
          <Text
            style={[
              styles.badgeText,
              {
                color: isStable
                  ? "#F59E0B"
                  : isIncreasing
                    ? "#EF4444"
                    : "#22C55E",
              },
            ]}
          >
            {isStable
              ? "Stable"
              : `${change > 0 ? "+" : ""}${change.toFixed(0)}%`}
          </Text>
        </View>
      </View>

      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={width - 64}
        height={180}
        chartConfig={{
          backgroundColor: C.surface,
          backgroundGradientFrom: C.surface,
          backgroundGradientTo: C.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
          labelColor: (opacity = 1) =>
            colorScheme === "dark"
              ? `rgba(255, 255, 255, ${opacity * 0.6})`
              : `rgba(0, 0, 0, ${opacity * 0.6})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#7C3AED",
          },
        }}
        bezier
        style={styles.chart}
      />

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: C.textSecondary }]}>
            Avg/Month
          </Text>
          <Text style={[styles.statValue, { color: C.text }]}>
            {average.toLocaleString("en-US", {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: C.textSecondary }]}>
            This Month
          </Text>
          <Text style={[styles.statValue, { color: C.text }]}>
            {lastMonth.toLocaleString("en-US", {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface TopCategoryProps {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  color: string;
  colorScheme: "light" | "dark";
  currency: string;
}

export function TopCategoryCard({
  name,
  icon,
  amount,
  percentage,
  color,
  colorScheme,
  currency,
}: TopCategoryProps) {
  const C = Colors[colorScheme];

  return (
    <View style={[styles.categoryCard, { backgroundColor: C.surface }]}>
      <View style={[styles.categoryIcon, { backgroundColor: color + "20" }]}>
        <Text style={styles.categoryEmoji}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.categoryName, { color: C.text }]}>{name}</Text>
        <Text style={[styles.categoryAmount, { color: C.text }]}>
          {amount.toLocaleString("en-US", {
            style: "currency",
            currency,
          })}
        </Text>
      </View>
      <View style={styles.percentageBadge}>
        <Text style={[styles.percentageText, { color }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}

interface InsightCardProps {
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  colorScheme: "light" | "dark";
}

export function InsightCard({
  type,
  title,
  message,
  colorScheme,
}: InsightCardProps) {
  const C = Colors[colorScheme];

  const config = {
    warning: { icon: "warning", color: "#F59E0B", bg: "#F59E0B15" },
    success: { icon: "checkmark-circle", color: "#22C55E", bg: "#22C55E15" },
    info: { icon: "information-circle", color: "#3B82F6", bg: "#3B82F615" },
  };

  const { icon, color, bg } = config[type];

  return (
    <View style={[styles.insightCard, { backgroundColor: bg }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.insightTitle, { color }]}>{title}</Text>
        <Text style={[styles.insightMessage, { color: C.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  percentageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "700",
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
});
