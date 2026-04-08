import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";

interface BudgetProgressBarProps {
  categoryName: string;
  categoryIcon?: string;
  allocated: number;
  spent: number;
  currency: string;
  colorScheme: "light" | "dark";
}

export function BudgetProgressBar({
  categoryName,
  categoryIcon,
  allocated,
  spent,
  currency,
  colorScheme,
}: BudgetProgressBarProps) {
  const C = Colors[colorScheme];

  const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
  const remaining = allocated - spent;
  const isOverBudget = spent > allocated;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  let barColor = "#22C55E"; // Green - under budget
  let statusIcon: any = "checkmark-circle";
  let statusColor = "#22C55E";

  if (isOverBudget) {
    barColor = "#EF4444"; // Red - over budget
    statusIcon = "alert-circle";
    statusColor = "#EF4444";
  } else if (isNearLimit) {
    barColor = "#F59E0B"; // Orange - near limit
    statusIcon = "warning";
    statusColor = "#F59E0B";
  }

  const displayPercentage = Math.min(percentage, 100);

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {categoryIcon && <Text style={styles.icon}>{categoryIcon}</Text>}
          <Text style={[styles.name, { color: C.text }]}>{categoryName}</Text>
        </View>
        <Ionicons name={statusIcon} size={18} color={statusColor} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.barBackground, { backgroundColor: C.background }]}>
        <View
          style={[
            styles.barFill,
            { backgroundColor: barColor, width: `${displayPercentage}%` },
          ]}
        />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View>
          <Text
            style={[
              styles.amount,
              { color: isOverBudget ? "#EF4444" : C.text },
            ]}
          >
            {spent.toLocaleString("en-US", { style: "currency", currency })}
          </Text>
          <Text style={[styles.label, { color: C.textSecondary }]}>
            of{" "}
            {allocated.toLocaleString("en-US", { style: "currency", currency })}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.percentage, { color: statusColor }]}>
            {percentage.toFixed(0)}%
          </Text>
          <Text style={[styles.label, { color: C.textSecondary }]}>
            {remaining >= 0
              ? `${remaining.toFixed(0)} left`
              : `${Math.abs(remaining).toFixed(0)} over`}
          </Text>
        </View>
      </View>

      {/* Warnings */}
      {isOverBudget && (
        <View style={[styles.warning, { backgroundColor: "#EF4444" + "15" }]}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={[styles.warningText, { color: "#EF4444" }]}>
            Over budget by{" "}
            {Math.abs(remaining).toLocaleString("en-US", {
              style: "currency",
              currency,
            })}
          </Text>
        </View>
      )}

      {isNearLimit && (
        <View style={[styles.warning, { backgroundColor: "#F59E0B" + "15" }]}>
          <Ionicons name="warning" size={14} color="#F59E0B" />
          <Text style={[styles.warningText, { color: "#F59E0B" }]}>
            {(100 - percentage).toFixed(0)}% of budget remaining
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  percentage: {
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
