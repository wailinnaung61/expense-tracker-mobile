import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { EmptyState } from "@/components/empty-state";
import { LoadingView } from "@/components/loading-view";
import { TransactionCard } from "@/components/transaction-card";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { transactionService } from "@/services/transaction.service";
import { Transaction, TransactionType } from "@/types/api.types";

const FILTERS: { label: string; value: TransactionType | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Expense", value: "Expense" },
  { label: "Income", value: "Income" },
  { label: "Investment", value: "Investment" },
  { label: "Savings", value: "Savings" },
];

const FILTER_COLORS: Record<string, string> = {
  Expense: "#EF4444",
  Income: "#22C55E",
  Investment: "#3B82F6",
  Savings: "#F59E0B",
};

export default function TransactionsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();

  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<TransactionType | undefined>(undefined);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (reset = false, type?: TransactionType, kw?: string) => {
      const p = reset ? 1 : page;
      try {
        const data = await transactionService.getTransactions({
          type,
          keyword: kw,
          pageNumber: p,
          pageSize: 20,
        });
        setItems(reset ? data.items : (prev) => [...prev, ...data.items]);
        setHasMore(data.hasNextPage);
        setPage(p + 1);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [page],
  );

  useEffect(() => {
    load(true, filter, keyword);
  }, []);

  function onRefresh() {
    setRefreshing(true);
    setPage(1);
    load(true, filter, keyword);
  }

  function onFilterChange(type: TransactionType | undefined) {
    setFilter(type);
    setPage(1);
    setLoading(true);
    load(true, type, keyword);
  }

  function onKeywordChange(text: string) {
    setKeyword(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setLoading(true);
      load(true, filter, text);
    }, 500);
  }

  function onEndReached() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    load(false, filter, keyword);
  }

  async function confirmDelete(id: string) {
    Alert.alert("Delete Transaction", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await transactionService.deleteTransaction(id);
            setItems((prev) => prev.filter((t) => t.tranactionId !== id));
          } catch {
            Alert.alert("Error", "Failed to delete transaction");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: C.background, borderBottomColor: C.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: C.text }]}>
          Transactions
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: C.tint }]}
          onPress={() =>
            router.push({
              pathname: "/transaction/create",
              params: { type: "Expense" },
            })
          }
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchWrapper,
          { backgroundColor: C.surface, borderColor: C.border },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={16}
          color={C.textSecondary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[styles.searchInput, { color: C.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={C.textSecondary}
          value={keyword}
          onChangeText={onKeywordChange}
        />
        {keyword ? (
          <TouchableOpacity onPress={() => onKeywordChange("")}>
            <Ionicons name="close-circle" size={16} color={C.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter pills */}
      <View style={{ paddingBottom: 12 }}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = item.value === filter;
            const activeColor = item.value ? FILTER_COLORS[item.value] : C.tint;
            return (
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  { borderColor: active ? activeColor : C.border },
                  active && { backgroundColor: activeColor },
                ]}
                onPress={() => onFilterChange(item.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? "#fff" : C.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Transaction list */}
      {loading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.tranactionId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.tint}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No transactions found"
              subtitle="Try adjusting your filters or add a new transaction"
              actionLabel="Add Transaction"
              onAction={() =>
                router.push({
                  pathname: "/transaction/create",
                  params: { type: "Expense" },
                })
              }
            />
          }
          ListFooterComponent={loadingMore ? <LoadingView /> : null}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onPress={() =>
                router.push({
                  pathname: "/transaction/[id]",
                  params: { id: item.tranactionId },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1.5,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterList: { paddingHorizontal: 16, gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
});
