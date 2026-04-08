import { BudgetProgressBar } from "@/components/budget-progress-bar";
import { Button, Card, ErrorMessage, LoadingSpinner } from "@/components/ui";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/useTranslation";
import { useBudgetStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function BudgetScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const { budget, isLoading, error, fetchBudget } = useBudgetStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currency = user?.currency ?? "USD";

  useEffect(() => {
    fetchBudget(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const calculatePercentage = (spent: number, allocated: number) => {
    if (allocated === 0) return 0;
    return Math.round((spent / allocated) * 100);
  };

  if (isLoading && !budget) {
    return <LoadingSpinner fullScreen message={t("common.loading")} />;
  }

  if (error && !budget) {
    return (
      <View style={styles.container}>
        <ErrorMessage
          message={error}
          onRetry={() => fetchBudget(selectedYear, selectedMonth)}
        />
      </View>
    );
  }

  if (!budget) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{t("budget.noBudget")}</Text>
          <Button variant="primary" onPress={() => {}}>
            {t("budget.createBudget")}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary Section */}
      <Card style={styles.summaryCard} variant="elevated">
        <Text style={styles.summaryTitle}>
          {new Date(selectedYear, selectedMonth - 1).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              {t("budget.totalAllocated")}
            </Text>
            <Text style={styles.summaryValue}>
              ${budget.totalAllocated.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t("budget.totalSpent")}</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              ${budget.totalSpent.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              {t("budget.totalRemaining")}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                budget.totalRemaining >= 0
                  ? styles.incomeText
                  : styles.expenseText,
              ]}
            >
              ${budget.totalRemaining.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Categories */}
      <View style={styles.categoriesHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {budget.categories.some((c) => c.spent / c.allocated >= 0.8) && (
          <View style={styles.alertBadge}>
            <Ionicons name="warning" size={14} color="#F59E0B" />
            <Text style={styles.alertText}>Attention needed</Text>
          </View>
        )}
      </View>

      {budget.categories.map((category) => (
        <BudgetProgressBar
          key={category.categoryId}
          categoryName={category.categoryName}
          allocated={category.allocated}
          spent={category.spent}
          currency={currency}
          colorScheme={colorScheme}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  incomeText: {
    color: Colors.light.income,
  },
  expenseText: {
    color: Colors.light.expense,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F59E0B15",
    borderRadius: 6,
  },
  alertText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
});
