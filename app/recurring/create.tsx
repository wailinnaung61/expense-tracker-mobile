import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { categoryService } from "@/services/category.service";
import { recurringPaymentService } from "@/services/recurring.service";
import type { Category } from "@/types/api.types";
import type { RecurringFrequency } from "@/types/recurring.types";

const FREQUENCIES: { label: string; value: RecurringFrequency; icon: any }[] = [
  { label: "Daily", value: "Daily", icon: "today" },
  { label: "Weekly", value: "Weekly", icon: "calendar" },
  { label: "Monthly", value: "Monthly", icon: "calendar-outline" },
  { label: "Yearly", value: "Yearly", icon: "calendar-number-outline" },
];

export default function CreateRecurringPaymentScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    amount: "",
    categoryId: "",
    frequency: "Monthly" as RecurringFrequency,
    nextDueDate: new Date(),
    isAutoPayment: false,
    notes: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoadingCats(true);
    try {
      // Get all category types
      const [expense, income, savings, investment] = await Promise.all([
        categoryService.getCategoryList("Expense"),
        categoryService.getCategoryList("Income"),
        categoryService.getCategoryList("Savings"),
        categoryService.getCategoryList("Investment"),
      ]);
      const all = [...expense, ...income, ...savings, ...investment];
      setCategories(all);
      if (all.length > 0 && !form.categoryId) {
        setForm((f) => ({ ...f, categoryId: all[0].categoryId }));
      }
    } catch {
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  }

  async function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!form.name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (!form.categoryId) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    setSaving(true);
    try {
      await recurringPaymentService.createPayment({
        name: form.name.trim(),
        amount,
        categoryId: form.categoryId,
        frequency: form.frequency,
        nextDueDate: form.nextDueDate.toISOString().split("T")[0],
        isAutoPayment: form.isAutoPayment,
        notes: form.notes.trim() || null,
      });
      Alert.alert("Success", "Recurring payment created!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "Failed to create recurring payment",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={10}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={24} color={C.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: C.text }]}>
                New Recurring Payment
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.text }]}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: C.surface, color: C.text },
                ]}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                placeholder="e.g., Netflix Subscription"
                placeholderTextColor={C.textSecondary}
              />
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.text }]}>Amount</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: C.surface, color: C.text },
                ]}
                value={form.amount}
                onChangeText={(v) => setForm({ ...form, amount: v })}
                placeholder="0.00"
                placeholderTextColor={C.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Frequency */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.text }]}>Frequency</Text>
              <View style={styles.frequencyGrid}>
                {FREQUENCIES.map((freq) => {
                  const selected = form.frequency === freq.value;
                  return (
                    <TouchableOpacity
                      key={freq.value}
                      style={[
                        styles.freqBtn,
                        { backgroundColor: C.surface },
                        selected && {
                          backgroundColor: "#8B5CF6" + "20",
                          borderColor: "#8B5CF6",
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() =>
                        setForm({ ...form, frequency: freq.value })
                      }
                    >
                      <Ionicons
                        name={freq.icon}
                        size={20}
                        color={selected ? "#8B5CF6" : C.icon}
                      />
                      <Text
                        style={[
                          styles.freqLabel,
                          { color: selected ? "#8B5CF6" : C.text },
                        ]}
                      >
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.text }]}>Category</Text>
              {loadingCats ? (
                <ActivityIndicator color={C.tint} />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  <View style={styles.categoryRow}>
                    {categories.map((cat) => {
                      const selected = form.categoryId === cat.categoryId;
                      return (
                        <TouchableOpacity
                          key={cat.categoryId}
                          style={[
                            styles.catBtn,
                            { backgroundColor: C.surface },
                            selected && {
                              backgroundColor: cat.color + "20",
                              borderColor: cat.color,
                              borderWidth: 2,
                            },
                          ]}
                          onPress={() =>
                            setForm({ ...form, categoryId: cat.categoryId })
                          }
                        >
                          <Text style={styles.catIcon}>{cat.icon}</Text>
                          <Text
                            style={[
                              styles.catName,
                              { color: C.text },
                              selected && { fontWeight: "600" },
                            ]}
                          >
                            {cat.displayName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* Next Due Date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.text }]}>
                Next Due Date
              </Text>
              <TouchableOpacity
                style={[styles.dateBtn, { backgroundColor: C.surface }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={C.icon} />
                <Text style={[styles.dateText, { color: C.text }]}>
                  {form.nextDueDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.nextDueDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) setForm({ ...form, nextDueDate: date });
                  }}
                />
              )}
            </View>

            {/* Auto Payment Toggle */}
            <View style={[styles.toggleRow, { backgroundColor: C.surface }]}>
              <View style={{ flex: 1 }}>
                <View style={styles.toggleHeader}>
                  <Ionicons name="flash" size={18} color="#3B82F6" />
                  <Text style={[styles.toggleLabel, { color: C.text }]}>
                    Auto Payment
                  </Text>
                </View>
                <Text style={[styles.toggleDesc, { color: C.textSecondary }]}>
                  Automatically create transaction on due date
                </Text>
              </View>
              <Switch
                value={form.isAutoPayment}
                onValueChange={(v) => setForm({ ...form, isAutoPayment: v })}
                trackColor={{ false: C.textSecondary, true: "#3B82F6" }}
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.text }]}>
                Notes (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: C.surface, color: C.text },
                ]}
                value={form.notes}
                onChangeText={(v) => setForm({ ...form, notes: v })}
                placeholder="Add notes..."
                placeholderTextColor={C.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: "#8B5CF6" }]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="repeat" size={20} color="#FFF" />
                  <Text style={styles.submitText}>
                    Create Recurring Payment
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  frequencyGrid: {
    flexDirection: "row",
    gap: 8,
  },
  freqBtn: {
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
  freqLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
  },
  catBtn: {
    minWidth: 90,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  catIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  catName: {
    fontSize: 11,
    textAlign: "center",
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  toggleDesc: {
    fontSize: 12,
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
