import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Card, LoadingSpinner, ErrorMessage } from "@/components/ui";
import { useDashboardStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { Colors } from "@/constants/theme";

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { dashboard, isLoading, error, fetchDashboard, refresh } =
    useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading && !dashboard) {
    return <LoadingSpinner fullScreen message={t("common.loading")} />;
  }

  if (error && !dashboard) {
    return <ErrorMessage message={error} onRetry={fetchDashboard} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t("dashboard.title")}</Text>
        <Text style={styles.subtitle}>{t("dashboard.welcome")}</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.summaryLabel}>{t("dashboard.totalIncome")}</Text>
          <Text style={[styles.summaryValue, styles.incomeText]}>
            ${dashboard?.totalIncome?.toFixed(2) || "0.00"}
          </Text>
        </Card>

        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.summaryLabel}>
            {t("dashboard.totalExpense")}
          </Text>
          <Text style={[styles.summaryValue, styles.expenseText]}>
            ${dashboard?.totalExpense?.toFixed(2) || "0.00"}
          </Text>
        </Card>

        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.summaryLabel}>
            {t("dashboard.totalSavings")}
          </Text>
          <Text style={[styles.summaryValue, styles.savingsText]}>
            ${dashboard?.totalGoalsSaved?.toFixed(2) || "0.00"}
          </Text>
        </Card>

        <Card style={styles.summaryCard} variant="elevated">
          <Text style={styles.summaryLabel}>{t("dashboard.netBalance")}</Text>
          <Text style={styles.summaryValue}>
            $
            {(
              (dashboard?.totalIncome || 0) - (dashboard?.totalExpense || 0)
            ).toFixed(2)}
          </Text>
        </Card>
      </View>

      {/* Recent Transactions */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("dashboard.recentTransactions")}
        </Text>
        {dashboard?.recentTransactions &&
        dashboard.recentTransactions.length > 0 ? (
          dashboard.recentTransactions.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.dateTime).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.transactionType === "Income"
                    ? styles.incomeText
                    : styles.expenseText,
                ]}
              >
                {transaction.transactionType === "Income" ? "+" : "-"}$
                {transaction.amount.toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{t("dashboard.noData")}</Text>
        )}
      </Card>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    minWidth: "45%",
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  incomeText: {
    color: Colors.light.income,
  },
  expenseText: {
    color: Colors.light.expense,
  },
  savingsText: {
    color: Colors.light.savings,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    paddingVertical: 16,
  },
});
