import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Card, LoadingSpinner, EmptyState, ErrorMessage } from "@/components/ui";
import { useTransactionStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { Colors } from "@/constants/theme";

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const {
    transactions,
    isLoading,
    error,
    hasMore,
    fetchTransactions,
    loadMore,
  } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const renderTransaction = ({ item }: any) => (
    <TouchableOpacity>
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>
              {item.description}
            </Text>
            <Text style={styles.transactionMeta}>
              {item.categoryName} • {new Date(item.dateTime).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.transactionRight}>
            <Text
              style={[
                styles.transactionAmount,
                item.transactionType === "Income"
                  ? styles.incomeText
                  : styles.expenseText,
              ]}
            >
              {item.transactionType === "Income" ? "+" : "-"}$
              {item.amount.toFixed(2)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                item.status === "Completed" && styles.completedBadge,
                item.status === "Pending" && styles.pendingBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.status === "Completed" && styles.completedText,
                  item.status === "Pending" && styles.pendingText,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && transactions.length === 0) {
    return <LoadingSpinner fullScreen message={t("common.loading")} />;
  }

  if (error && transactions.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={fetchTransactions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={t("transactions.noTransactions")}
            description="Start tracking your expenses"
          />
        }
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && isLoading ? (
            <LoadingSpinner message={t("common.loading")} />
          ) : null
        }
      />

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  list: {
    padding: 16,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  incomeText: {
    color: Colors.light.income,
  },
  expenseText: {
    color: Colors.light.expense,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedBadge: {
    backgroundColor: "#D1FAE5",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  completedText: {
    color: "#065F46",
  },
  pendingText: {
    color: "#92400E",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
