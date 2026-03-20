import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { categoryService } from "@/services/category.service";
import { transactionService } from "@/services/transaction.service";
import { Category, PaymentStatus, TransactionType } from "@/types/api.types";

const TX_TYPES: {
  label: string;
  value: TransactionType;
  icon: string;
  color: string;
}[] = [
  {
    label: "Expense",
    value: "Expense",
    icon: "arrow-up-circle",
    color: "#EF4444",
  },
  {
    label: "Income",
    value: "Income",
    icon: "arrow-down-circle",
    color: "#22C55E",
  },
  { label: "Savings", value: "Savings", icon: "wallet", color: "#F59E0B" },
  {
    label: "Investment",
    value: "Investment",
    icon: "trending-up",
    color: "#3B82F6",
  },
];

const STATUSES: { label: string; value: PaymentStatus }[] = [
  { label: "Completed", value: "Completed" },
  { label: "Pending", value: "Pending" },
  { label: "Failed", value: "Failed" },
];

export default function CreateTransactionScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: TransactionType }>();

  const [txType, setTxType] = useState<TransactionType>(
    params.type ?? "Expense",
  );
  const [form, setForm] = useState({
    amount: "",
    description: "",
    note: "",
    tranactionDate: format(new Date(), "yyyy-MM-dd"),
    status: "Completed" as PaymentStatus,
    categoryId: "",
    imageUrl: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories(txType);
  }, [txType]);

  async function loadCategories(type: TransactionType) {
    setLoadingCats(true);
    setForm((f) => ({ ...f, categoryId: "" }));
    try {
      const cats = await categoryService.getCategoryList(type);
      setCategories(cats);
      if (cats.length > 0)
        setForm((f) => ({ ...f, categoryId: cats[0].categoryId }));
    } catch {
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  }

  async function handleSave() {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!form.categoryId) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!form.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }
    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tranactionDate)) {
      Alert.alert("Error", "Date must be in YYYY-MM-DD format");
      return;
    }
    setSaving(true);
    try {
      await transactionService.createTransaction({
        type: txType,
        categoryId: form.categoryId,
        amount,
        tranactionDate: form.tranactionDate,
        status: form.status,
        description: form.description.trim(),
        note: form.note.trim(),
        imageUrl: form.imageUrl.trim(),
      });
      Alert.alert("Success", "Transaction created!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create transaction";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  }

  const selectedType = TX_TYPES.find((t) => t.value === txType)!;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type selector */}
          <Text style={[styles.sectionTitle, { color: C.text }]}>
            Transaction Type
          </Text>
          <View style={styles.typeRow}>
            {TX_TYPES.map((t) => {
              const active = t.value === txType;
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.typeBtn,
                    {
                      borderColor: active ? t.color : C.border,
                      backgroundColor: active ? t.color + "15" : C.surface,
                    },
                  ]}
                  onPress={() => setTxType(t.value)}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={20}
                    color={active ? t.color : C.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      { color: active ? t.color : C.textSecondary },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount */}
          <Text style={[styles.sectionTitle, { color: C.text }]}>Amount</Text>
          <View
            style={[
              styles.amountWrapper,
              { borderColor: selectedType.color, backgroundColor: C.surface },
            ]}
          >
            <Text style={[styles.currencySign, { color: selectedType.color }]}>
              $
            </Text>
            <TextInput
              style={[styles.amountInput, { color: C.text }]}
              placeholder="0.00"
              placeholderTextColor={C.textSecondary}
              value={form.amount}
              onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category */}
          <Text style={[styles.sectionTitle, { color: C.text }]}>Category</Text>
          {loadingCats ? (
            <ActivityIndicator color={C.tint} style={{ marginBottom: 16 }} />
          ) : categories.length === 0 ? (
            <View style={[styles.infoBox, { backgroundColor: C.surface }]}>
              <Text style={{ color: C.textSecondary, fontSize: 13 }}>
                No categories for this type.{" "}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/category/create",
                    params: { type: txType },
                  })
                }
              >
                <Text
                  style={{ color: C.tint, fontWeight: "600", fontSize: 13 }}
                >
                  Create one →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.catScroll}
              contentContainerStyle={styles.catScrollContent}
            >
              {categories.map((cat) => {
                const active = cat.categoryId === form.categoryId;
                return (
                  <TouchableOpacity
                    key={cat.categoryId}
                    style={[
                      styles.catChip,
                      {
                        borderColor: active ? (cat.color ?? C.tint) : C.border,
                        backgroundColor: active
                          ? (cat.color ?? C.tint) + "20"
                          : C.surface,
                      },
                    ]}
                    onPress={() =>
                      setForm((f) => ({ ...f, categoryId: cat.categoryId }))
                    }
                  >
                    <Text style={styles.catChipIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.catChipText,
                        {
                          color: active
                            ? (cat.color ?? C.tint)
                            : C.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.displayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: C.text }]}>
            Description
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { borderColor: C.border, backgroundColor: C.surface },
            ]}
          >
            <TextInput
              style={[styles.input, { color: C.text }]}
              placeholder="What was this for?"
              placeholderTextColor={C.textSecondary}
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            />
          </View>

          {/* Date */}
          <Text style={[styles.sectionTitle, { color: C.text }]}>
            Date{" "}
            <Text style={{ fontSize: 12, color: C.textSecondary }}>
              (YYYY-MM-DD)
            </Text>
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { borderColor: C.border, backgroundColor: C.surface },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={C.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: C.text }]}
              placeholder="2026-01-15"
              placeholderTextColor={C.textSecondary}
              value={form.tranactionDate}
              onChangeText={(v) =>
                setForm((f) => ({ ...f, tranactionDate: v }))
              }
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>

          {/* Status */}
          <Text style={[styles.sectionTitle, { color: C.text }]}>Status</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => {
              const active = s.value === form.status;
              const color =
                s.value === "Completed"
                  ? "#22C55E"
                  : s.value === "Pending"
                    ? "#F59E0B"
                    : "#EF4444";
              return (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.statusBtn,
                    {
                      borderColor: active ? color : C.border,
                      backgroundColor: active ? color + "15" : C.surface,
                    },
                  ]}
                  onPress={() => setForm((f) => ({ ...f, status: s.value }))}
                >
                  <Text
                    style={[
                      styles.statusBtnText,
                      { color: active ? color : C.textSecondary },
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Note (optional) */}
          <Text style={[styles.sectionTitle, { color: C.text }]}>
            Note{" "}
            <Text style={{ fontSize: 12, color: C.textSecondary }}>
              (optional)
            </Text>
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor: C.border,
                backgroundColor: C.surface,
                minHeight: 80,
                alignItems: "flex-start",
                paddingTop: 12,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                { color: C.text, textAlignVertical: "top" },
              ]}
              placeholder="Additional notes..."
              placeholderTextColor={C.textSecondary}
              value={form.note}
              onChangeText={(v) => setForm((f) => ({ ...f, note: v }))}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              style={styles.saveBtn}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.saveBtnText}>Save Transaction</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  body: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
  },
  typeBtnText: { fontSize: 11, fontWeight: "600" },
  amountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 68,
  },
  currencySign: { fontSize: 28, fontWeight: "700", marginRight: 4 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: "700" },
  catScroll: { marginBottom: 4 },
  catScrollContent: { gap: 8, paddingRight: 16 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
    maxWidth: 140,
  },
  catChipIcon: { fontSize: 16 },
  catChipText: { fontSize: 13, fontWeight: "500", flexShrink: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15 },
  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  statusBtnText: { fontSize: 13, fontWeight: "600" },
  infoBox: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
    alignItems: "center",
  },
  saveBtn: {
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
