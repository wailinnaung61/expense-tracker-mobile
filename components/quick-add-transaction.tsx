import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { categoryService } from "@/services/category.service";
import { transactionService } from "@/services/transaction.service";
import type { Category, TransactionType } from "@/types/api.types";

const QUICK_TYPES: {
  label: string;
  value: TransactionType;
  icon: any;
  color: string;
}[] = [
  {
    label: "Expense",
    value: "Expense",
    icon: "remove-circle",
    color: "#EF4444",
  },
  { label: "Income", value: "Income", icon: "add-circle", color: "#22C55E" },
  { label: "Savings", value: "Savings", icon: "wallet", color: "#F59E0B" },
  {
    label: "Investment",
    value: "Investment",
    icon: "trending-up",
    color: "#3B82F6",
  },
];

interface QuickAddTransactionProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: TransactionType;
}

export function QuickAddTransaction({
  visible,
  onClose,
  onSuccess,
  initialType = "Expense",
}: QuickAddTransactionProps) {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { user } = useAuth();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCategories(type);
    }
  }, [visible, type]);

  async function loadCategories(txType: TransactionType) {
    setLoading(true);
    try {
      const cats = await categoryService.getCategoryList(txType);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].categoryId);
      }
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }
    if (!categoryId) {
      Alert.alert("Missing Category", "Please select a category");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Missing Description", "Please enter a description");
      return;
    }

    setSaving(true);
    try {
      await transactionService.createTransaction({
        type,
        categoryId,
        amount: amountNum,
        tranactionDate: new Date().toISOString().split("T")[0],
        status: "Completed",
        description: description.trim(),
        note: "",
        imageUrl: "",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAmount("");
      setDescription("");
      onClose();
      onSuccess?.();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "Failed to create transaction",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setAmount("");
    setDescription("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.modal, { backgroundColor: C.card }]}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: C.text }]}>Quick Add</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={C.text} />
            </TouchableOpacity>
          </View>

          {/* Type Selector */}
          <View style={styles.typeContainer}>
            {QUICK_TYPES.map((t) => {
              const selected = type === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.typeBtn,
                    selected && {
                      backgroundColor: t.color + "20",
                      borderColor: t.color,
                    },
                  ]}
                  onPress={() => {
                    setType(t.value);
                    setCategoryId("");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons
                    name={t.icon}
                    size={20}
                    color={selected ? t.color : C.icon}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: selected ? t.color : C.text },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>
              Amount
            </Text>
            <View
              style={[styles.amountInput, { backgroundColor: C.background }]}
            >
              <Text style={[styles.currencySymbol, { color: C.text }]}>
                {user?.currency === "MMK"
                  ? "K"
                  : user?.currency === "JPY"
                    ? "¥"
                    : "$"}
              </Text>
              <TextInput
                style={[styles.amountText, { color: C.text }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={C.textSecondary}
                keyboardType="numeric"
                autoFocus
              />
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>
              Category
            </Text>
            {loading ? (
              <ActivityIndicator color={C.tint} />
            ) : (
              <View style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const selected = categoryId === cat.categoryId;
                  return (
                    <TouchableOpacity
                      key={cat.categoryId}
                      style={[
                        styles.categoryBtn,
                        { backgroundColor: C.background },
                        selected && {
                          backgroundColor: cat.color + "20",
                          borderColor: cat.color,
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => {
                        setCategoryId(cat.categoryId);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryName,
                          { color: C.text },
                          selected && { fontWeight: "600" },
                        ]}
                        numberOfLines={1}
                      >
                        {cat.displayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: C.background, color: C.text },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="What did you spend on?"
              placeholderTextColor={C.textSecondary}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: QUICK_TYPES.find((t) => t.value === type)!
                  .color,
              },
            ]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.submitText}>Add {type}</Text>
              </>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    marginRight: 8,
  },
  amountText: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 11,
    textAlign: "center",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
