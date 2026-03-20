import { Ionicons } from "@expo/vector-icons";
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

import { LoadingView } from "@/components/loading-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { categoryService } from "@/services/category.service";
import { transactionService } from "@/services/transaction.service";
import {
    Category,
    PaymentStatus,
    Transaction,
    TransactionType,
} from "@/types/api.types";

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

const STATUSES: { label: string; value: PaymentStatus; color: string }[] = [
  { label: "Completed", value: "Completed", color: "#22C55E" },
  { label: "Pending", value: "Pending", color: "#F59E0B" },
  { label: "Failed", value: "Failed", color: "#EF4444" },
];

export default function TransactionDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [tx, setTx] = useState<Transaction | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [txType, setTxType] = useState<TransactionType>("Expense");
  const [form, setForm] = useState({
    amount: "",
    description: "",
    note: "",
    tranactionDate: "",
    status: "Completed" as PaymentStatus,
    categoryId: "",
    imageUrl: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  async function loadTransaction() {
    if (!id) return;
    try {
      const data = await transactionService.getTransactionById(id);
      setTx(data);
      setTxType(data.type);
      setForm({
        amount: data.amount.toString(),
        description: data.description,
        note: data.note,
        tranactionDate: data.tranactionDate,
        status: data.status,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl ?? "",
      });
      const cats = await categoryService.getCategoryList(data.type);
      setCategories(cats);
    } catch {
      Alert.alert("Error", "Failed to load transaction", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories(type: TransactionType) {
    try {
      const cats = await categoryService.getCategoryList(type);
      setCategories(cats);
      if (
        cats.length > 0 &&
        cats.findIndex((c) => c.categoryId === form.categoryId) === -1
      ) {
        setForm((f) => ({ ...f, categoryId: cats[0].categoryId }));
      }
    } catch {
      setCategories([]);
    }
  }

  async function handleSave() {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }
    if (!form.categoryId) {
      Alert.alert("Error", "Select a category");
      return;
    }
    if (!form.description.trim()) {
      Alert.alert("Error", "Enter a description");
      return;
    }
    setSaving(true);
    try {
      await transactionService.updateTransaction(id!, {
        type: txType,
        categoryId: form.categoryId,
        amount,
        tranactionDate: form.tranactionDate,
        status: form.status,
        description: form.description.trim(),
        note: form.note.trim(),
        imageUrl: form.imageUrl.trim(),
      });
      Alert.alert("Success", "Transaction updated!");
      setEditMode(false);
      loadTransaction();
    } catch {
      Alert.alert("Error", "Failed to update transaction");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert("Delete Transaction", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await transactionService.deleteTransaction(id!);
            router.back();
          } catch {
            Alert.alert("Error", "Failed to delete");
            setDeleting(false);
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingView fullScreen />;
  if (!tx) return null;

  const selectedType = TX_TYPES.find((t) => t.value === txType)!;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editMode ? "Edit Transaction" : "Transaction Detail"}
          </Text>
          <TouchableOpacity
            onPress={() => setEditMode(!editMode)}
            style={styles.editBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
              {editMode ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount hero */}
          {!editMode && (
            <View style={[styles.heroCard, { backgroundColor: C.surface }]}>
              <View
                style={[
                  styles.typeIcon,
                  { backgroundColor: selectedType.color + "20" },
                ]}
              >
                <Ionicons
                  name={selectedType.icon as any}
                  size={28}
                  color={selectedType.color}
                />
              </View>
              <Text
                style={[
                  styles.heroAmount,
                  {
                    color:
                      txType === "Expense" ? C.expense : selectedType.color,
                  },
                ]}
              >
                {txType === "Expense" ? "-" : "+"}
                {tx.amount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Text>
              <Text style={[styles.heroDesc, { color: C.text }]}>
                {tx.description}
              </Text>
              <Text style={[styles.heroMeta, { color: C.textSecondary }]}>
                {tx.categoryName} · {tx.tranactionDate}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusClr(tx.status, colorScheme) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: statusClr(tx.status, colorScheme) },
                  ]}
                >
                  {tx.status}
                </Text>
              </View>
            </View>
          )}

          {editMode ? (
            <>
              {/* Type selector */}
              <Text style={[styles.label, { color: C.text }]}>Type</Text>
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
                      onPress={() => {
                        setTxType(t.value);
                        loadCategories(t.value);
                      }}
                    >
                      <Ionicons
                        name={t.icon as any}
                        size={18}
                        color={active ? t.color : C.textSecondary}
                      />
                      <Text
                        style={[
                          {
                            fontSize: 11,
                            fontWeight: "600",
                            color: active ? t.color : C.textSecondary,
                          },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Amount */}
              <Text style={[styles.label, { color: C.text }]}>Amount</Text>
              <View
                style={[
                  styles.amountWrapper,
                  {
                    borderColor: selectedType.color,
                    backgroundColor: C.surface,
                  },
                ]}
              >
                <Text
                  style={[styles.currencySign, { color: selectedType.color }]}
                >
                  $
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: C.text }]}
                  value={form.amount}
                  onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Category */}
              <Text style={[styles.label, { color: C.text }]}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((cat) => {
                  const active = cat.categoryId === form.categoryId;
                  return (
                    <TouchableOpacity
                      key={cat.categoryId}
                      style={[
                        styles.catChip,
                        {
                          borderColor: active
                            ? (cat.color ?? C.tint)
                            : C.border,
                          backgroundColor: active
                            ? (cat.color ?? C.tint) + "20"
                            : C.surface,
                        },
                      ]}
                      onPress={() =>
                        setForm((f) => ({ ...f, categoryId: cat.categoryId }))
                      }
                    >
                      <Text>{cat.icon}</Text>
                      <Text
                        style={[
                          {
                            fontSize: 12,
                            fontWeight: "500",
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

              {/* Description, date, note */}
              {(
                [
                  {
                    key: "description",
                    label: "Description",
                    multiline: false,
                  },
                  {
                    key: "tranactionDate",
                    label: "Date (YYYY-MM-DD)",
                    multiline: false,
                  },
                  { key: "note", label: "Note", multiline: true },
                ] as const
              ).map(({ key, label, multiline }) => (
                <View key={key}>
                  <Text style={[styles.label, { color: C.text }]}>{label}</Text>
                  <TextInput
                    style={[
                      styles.inputField,
                      {
                        color: C.text,
                        borderColor: C.border,
                        backgroundColor: C.surface,
                        minHeight: multiline ? 72 : 44,
                        textAlignVertical: multiline ? "top" : "center",
                      },
                    ]}
                    value={form[key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    multiline={multiline}
                    keyboardType={
                      key === "tranactionDate"
                        ? "numbers-and-punctuation"
                        : "default"
                    }
                  />
                </View>
              ))}

              {/* Status */}
              <Text style={[styles.label, { color: C.text }]}>Status</Text>
              <View style={styles.statusRow}>
                {STATUSES.map((s) => {
                  const active = s.value === form.status;
                  return (
                    <TouchableOpacity
                      key={s.value}
                      style={[
                        styles.statusBtn,
                        {
                          borderColor: active ? s.color : C.border,
                          backgroundColor: active ? s.color + "15" : C.surface,
                        },
                      ]}
                      onPress={() =>
                        setForm((f) => ({ ...f, status: s.value }))
                      }
                    >
                      <Text
                        style={[
                          {
                            fontSize: 12,
                            fontWeight: "600",
                            color: active ? s.color : C.textSecondary,
                          },
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={{ marginTop: 12 }}
              >
                <LinearGradient
                  colors={["#7C3AED", "#4F46E5"]}
                  style={styles.saveBtn}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            /* Detail rows */
            <View style={[styles.detailCard, { backgroundColor: C.surface }]}>
              {[
                { label: "Category", value: tx.categoryName },
                { label: "Merchant", value: tx.merchant || "—" },
                { label: "Payment Method", value: tx.paymentMethod || "—" },
                { label: "Transaction Date", value: tx.tranactionDate },
                { label: "Created At", value: tx.createdAt.split("T")[0] },
                { label: "Note", value: tx.note || "—" },
              ].map(({ label, value }) => (
                <View
                  key={label}
                  style={[styles.detailRow, { borderBottomColor: C.border }]}
                >
                  <Text
                    style={[styles.detailLabel, { color: C.textSecondary }]}
                  >
                    {label}
                  </Text>
                  <Text style={[styles.detailValue, { color: C.text }]}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Delete */}
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            style={[styles.deleteBtn, { borderColor: C.error }]}
          >
            {deleting ? (
              <ActivityIndicator color={C.error} size="small" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={16} color={C.error} />
                <Text style={[styles.deleteBtnText, { color: C.error }]}>
                  Delete Transaction
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function statusClr(s: string, scheme: "light" | "dark") {
  const C = Colors[scheme];
  return s === "Completed" ? C.success : s === "Failed" ? C.error : C.warning;
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
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  body: { padding: 16, paddingBottom: 40 },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroAmount: { fontSize: 36, fontWeight: "800", marginBottom: 4 },
  heroDesc: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  heroMeta: { fontSize: 13, marginBottom: 10 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 16 },
  statusBadgeText: { fontSize: 12, fontWeight: "700" },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
  },
  amountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 4,
  },
  currencySign: { fontSize: 24, fontWeight: "700", marginRight: 4 },
  amountInput: { flex: 1, fontSize: 32, fontWeight: "700" },
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
  inputField: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 4,
  },
  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  saveBtn: {
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  detailCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  detailLabel: { fontSize: 13, fontWeight: "500", flex: 1 },
  detailValue: { fontSize: 14, fontWeight: "500", textAlign: "right", flex: 2 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    height: 48,
    marginTop: 8,
  },
  deleteBtnText: { fontWeight: "700", fontSize: 14 },
});
