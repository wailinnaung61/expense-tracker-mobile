import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Transaction } from "@/types/api.types";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TYPE_CONFIG = {
  Income: { icon: "arrow-down-circle", color: "#22C55E" },
  Expense: { icon: "arrow-up-circle", color: "#EF4444" },
  Investment: { icon: "trending-up", color: "#3B82F6" },
  Savings: { icon: "wallet", color: "#F59E0B" },
} as const;

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const cfg = TYPE_CONFIG[transaction.type] ?? TYPE_CONFIG.Expense;
  const isDebit = transaction.type === "Expense";

  let displayDate = transaction.tranactionDate;
  try {
    displayDate = format(
      new Date(transaction.tranactionDate + "T00:00:00"),
      "MMM d",
    );
  } catch {
    /* keep original */
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.surface, shadowColor: "#000" }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: cfg.color + "20" }]}
      >
        <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: C.text }]} numberOfLines={1}>
          {transaction.description || transaction.categoryName}
        </Text>
        <Text
          style={[styles.meta, { color: C.textSecondary }]}
          numberOfLines={1}
        >
          {transaction.categoryName} · {displayDate}
        </Text>
      </View>

      <View style={styles.right}>
        <Text
          style={[styles.amount, { color: isDebit ? C.expense : cfg.color }]}
        >
          {isDebit ? "-" : "+"}
          {transaction.amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          })}
        </Text>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor:
                statusColor(transaction.status, colorScheme) + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusColor(transaction.status, colorScheme) },
            ]}
          >
            {transaction.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function statusColor(status: string, scheme: "light" | "dark") {
  const C = Colors[scheme];
  if (status === "Completed") return C.success;
  if (status === "Failed") return C.error;
  return C.warning;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  description: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  meta: { fontSize: 12 },
  right: { alignItems: "flex-end" },
  amount: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: "600" },
});
