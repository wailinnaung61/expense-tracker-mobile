import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { PaymentStatus, TransactionType } from "@/types/api.types";

export interface TransactionFilters {
  keyword?: string;
  type?: TransactionType;
  status?: PaymentStatus;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: TransactionFilters) => void;
  currentFilters: TransactionFilters;
  categories?: Array<{ categoryId: string; displayName: string; icon: string }>;
}

const TRANSACTION_TYPES: { label: string; value: TransactionType }[] = [
  { label: "All Types", value: undefined as any },
  { label: "Expense", value: "Expense" },
  { label: "Income", value: "Income" },
  { label: "Savings", value: "Savings" },
  { label: "Investment", value: "Investment" },
];

const STATUSES: { label: string; value: PaymentStatus }[] = [
  { label: "All Statuses", value: undefined as any },
  { label: "Completed", value: "Completed" },
  { label: "Pending", value: "Pending" },
  { label: "Failed", value: "Failed" },
];

export function FilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
  categories = [],
}: FilterModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];

  const [filters, setFilters] = useState<TransactionFilters>(currentFilters);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  function handleReset() {
    setFilters({});
    onApply({});
    onClose();
  }

  function handleApply() {
    onApply(filters);
    onClose();
  }

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== "",
  ).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: C.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: C.text }]}>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Text>
          <TouchableOpacity onPress={handleReset} hitSlop={10}>
            <Text style={[styles.resetBtn, { color: C.tint }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Keyword */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Search</Text>
            <View style={[styles.searchBox, { backgroundColor: C.surface }]}>
              <Ionicons name="search" size={18} color={C.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: C.text }]}
                value={filters.keyword || ""}
                onChangeText={(text) =>
                  setFilters({ ...filters, keyword: text })
                }
                placeholder="Search description, merchant..."
                placeholderTextColor={C.textSecondary}
              />
              {filters.keyword && (
                <TouchableOpacity
                  onPress={() => setFilters({ ...filters, keyword: "" })}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={C.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Transaction Type */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Type</Text>
            <View style={styles.chipRow}>
              {TRANSACTION_TYPES.map((type) => {
                const selected = filters.type === type.value;
                return (
                  <TouchableOpacity
                    key={type.label}
                    style={[
                      styles.chip,
                      { backgroundColor: C.surface },
                      selected && {
                        backgroundColor: C.tint + "20",
                        borderColor: C.tint,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => setFilters({ ...filters, type: type.value })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selected ? C.tint : C.text },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Status</Text>
            <View style={styles.chipRow}>
              {STATUSES.map((status) => {
                const selected = filters.status === status.value;
                return (
                  <TouchableOpacity
                    key={status.label}
                    style={[
                      styles.chip,
                      { backgroundColor: C.surface },
                      selected && {
                        backgroundColor: C.tint + "20",
                        borderColor: C.tint,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, status: status.value })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selected ? C.tint : C.text },
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Categories */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    { backgroundColor: C.surface },
                    !filters.categoryId && {
                      backgroundColor: C.tint + "20",
                      borderColor: C.tint,
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={() =>
                    setFilters({ ...filters, categoryId: undefined })
                  }
                >
                  <Text style={styles.categoryIcon}>🏷️</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      { color: !filters.categoryId ? C.tint : C.text },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => {
                  const selected = filters.categoryId === cat.categoryId;
                  return (
                    <TouchableOpacity
                      key={cat.categoryId}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: C.surface },
                        selected && {
                          backgroundColor: C.tint + "20",
                          borderColor: C.tint,
                          borderWidth: 1.5,
                        },
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, categoryId: cat.categoryId })
                      }
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryText,
                          { color: selected ? C.tint : C.text },
                        ]}
                      >
                        {cat.displayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              Date Range
            </Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateBox, { backgroundColor: C.surface }]}
                onPress={() => setShowStartDate(true)}
              >
                <Text style={[styles.dateLabel, { color: C.textSecondary }]}>
                  From
                </Text>
                <Text style={[styles.dateValue, { color: C.text }]}>
                  {filters.startDate || "Any"}
                </Text>
              </TouchableOpacity>
              <View style={styles.dateSeparator}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={C.textSecondary}
                />
              </View>
              <TouchableOpacity
                style={[styles.dateBox, { backgroundColor: C.surface }]}
                onPress={() => setShowEndDate(true)}
              >
                <Text style={[styles.dateLabel, { color: C.textSecondary }]}>
                  To
                </Text>
                <Text style={[styles.dateValue, { color: C.text }]}>
                  {filters.endDate || "Any"}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartDate && (
              <DateTimePicker
                value={
                  filters.startDate ? new Date(filters.startDate) : new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, date) => {
                  setShowStartDate(Platform.OS === "ios");
                  if (date) {
                    setFilters({
                      ...filters,
                      startDate: format(date, "yyyy-MM-dd"),
                    });
                  }
                }}
              />
            )}

            {showEndDate && (
              <DateTimePicker
                value={filters.endDate ? new Date(filters.endDate) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, date) => {
                  setShowEndDate(Platform.OS === "ios");
                  if (date) {
                    setFilters({
                      ...filters,
                      endDate: format(date, "yyyy-MM-dd"),
                    });
                  }
                }}
              />
            )}
          </View>

          {/* Amount Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              Amount Range
            </Text>
            <View style={styles.amountRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.amountLabel, { color: C.textSecondary }]}>
                  Min Amount
                </Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    { backgroundColor: C.surface, color: C.text },
                  ]}
                  value={filters.minAmount?.toString() || ""}
                  onChangeText={(text) => {
                    const num = parseFloat(text);
                    setFilters({
                      ...filters,
                      minAmount: isNaN(num) ? undefined : num,
                    });
                  }}
                  placeholder="0"
                  placeholderTextColor={C.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.amountSeparator}>
                <Text style={[{ color: C.textSecondary }]}>-</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.amountLabel, { color: C.textSecondary }]}>
                  Max Amount
                </Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    { backgroundColor: C.surface, color: C.text },
                  ]}
                  value={filters.maxAmount?.toString() || ""}
                  onChangeText={(text) => {
                    const num = parseFloat(text);
                    setFilters({
                      ...filters,
                      maxAmount: isNaN(num) ? undefined : num,
                    });
                  }}
                  placeholder="∞"
                  placeholderTextColor={C.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            { backgroundColor: C.background, borderTopColor: C.border },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: C.tint }]}
            onPress={handleApply}
          >
            <Text style={styles.applyText}>
              Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  resetBtn: {
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  dateBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateSeparator: {
    width: 24,
    alignItems: "center",
  },
  amountRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  amountInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
  },
  amountSeparator: {
    paddingBottom: 12,
    width: 16,
    alignItems: "center",
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
  },
  applyBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
