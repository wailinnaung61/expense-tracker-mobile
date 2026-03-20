import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { CategoryCard } from "@/components/category-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingView } from "@/components/loading-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { categoryService } from "@/services/category.service";
import { Category, TransactionType } from "@/types/api.types";

const TABS: { label: string; value: TransactionType }[] = [
  { label: "Expense", value: "Expense" },
  { label: "Income", value: "Income" },
  { label: "Investment", value: "Investment" },
  { label: "Savings", value: "Savings" },
];

const TAB_COLORS: Record<TransactionType, string> = {
  Expense: "#EF4444",
  Income: "#22C55E",
  Investment: "#3B82F6",
  Savings: "#F59E0B",
};

export default function CategoriesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TransactionType>("Expense");
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (type: TransactionType) => {
    try {
      const data = await categoryService.getCategoryList(type);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load(activeTab);
  }, [activeTab, load]);

  function onTabChange(tab: TransactionType) {
    setActiveTab(tab);
  }

  async function deleteCategory(cat: Category) {
    Alert.alert(`Delete "${cat.displayName}"?`, "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await categoryService.deleteCategory(cat.categoryId);
            setItems((prev) =>
              prev.filter((c) => c.categoryId !== cat.categoryId),
            );
          } catch {
            Alert.alert("Error", "Failed to delete category");
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Categories</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: C.tint }]}
          onPress={() =>
            router.push({
              pathname: "/category/create",
              params: { type: activeTab },
            })
          }
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Type tabs */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: C.surface, borderBottomColor: C.border },
        ]}
      >
        {TABS.map((tab) => {
          const active = tab.value === activeTab;
          const color = TAB_COLORS[tab.value];
          return (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.tab,
                active && { borderBottomColor: color, borderBottomWidth: 2.5 },
              ]}
              onPress={() => onTabChange(tab.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: active ? color : C.textSecondary,
                    fontWeight: active ? "700" : "500",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category list */}
      {loading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(c) => c.categoryId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(activeTab);
              }}
              tintColor={C.tint}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="pricetag-outline"
              title={`No ${activeTab.toLowerCase()} categories`}
              subtitle="Tap + to create a new category"
              actionLabel="Create Category"
              onAction={() =>
                router.push({
                  pathname: "/category/create",
                  params: { type: activeTab },
                })
              }
            />
          }
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() =>
                router.push({
                  pathname: "/category/[id]",
                  params: { id: item.categoryId },
                })
              }
              onLongPress={() => deleteCategory(item)}
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
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13 },
  list: { padding: 16, paddingBottom: 100 },
});
