import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { savingsService } from "@/services/savings.service";
import type { ContributionFrequency } from "@/types/savings.types";

const FREQUENCIES: {
  label: string;
  value: ContributionFrequency;
  icon: any;
}[] = [
  { label: "One-Time", value: "OneTime", icon: "flash-outline" },
  { label: "Daily", value: "Daily", icon: "today" },
  { label: "Weekly", value: "Weekly", icon: "calendar" },
  { label: "Monthly", value: "Monthly", icon: "calendar-outline" },
  { label: "Yearly", value: "Yearly", icon: "calendar-number-outline" },
];

export default function CreateSavingsGoalScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();

  const [form, setForm] = useState({
    goalName: "",
    targetAmount: "",
    deadline: undefined as Date | undefined,
    hasDeadline: false,
    hasRecurring: false,
    contributionFrequency: "Monthly" as ContributionFrequency,
    contributionAmount: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const targetAmount = parseFloat(form.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert("Error", "Please enter a valid target amount");
      return;
    }
    if (!form.goalName.trim()) {
      Alert.alert("Error", "Please enter a goal name");
      return;
    }

    const contributionAmount = form.hasRecurring
      ? parseFloat(form.contributionAmount)
      : undefined;
    if (
      form.hasRecurring &&
      (isNaN(contributionAmount!) || contributionAmount! <= 0)
    ) {
      Alert.alert("Error", "Please enter a valid contribution amount");
      return;
    }

    setSaving(true);
    try {
      await savingsService.createGoal({
        goalName: form.goalName.trim(),
        targetAmount,
        deadline:
          form.hasDeadline && form.deadline
            ? form.deadline.toISOString().split("T")[0]
            : null,
        contributionFrequency: form.hasRecurring
          ? form.contributionFrequency
          : null,
        contributionAmount: form.hasRecurring ? contributionAmount : null,
      });
      Alert.alert("Success", "Savings goal created!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "Failed to create savings goal",
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
                New Savings Goal
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Goal Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.text }]}>Goal Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: C.surface, color: C.text },
                ]}
                value={form.goalName}
                onChangeText={(v) => setForm({ ...form, goalName: v })}
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                placeholderTextColor={C.textSecondary}
              />
            </View>

            {/* Target Amount */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: C.text }]}>
                Target Amount
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: C.surface, color: C.text },
                ]}
                value={form.targetAmount}
                onChangeText={(v) => setForm({ ...form, targetAmount: v })}
                placeholder="0.00"
                placeholderTextColor={C.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Deadline Toggle */}
            <View style={[styles.toggleRow, { backgroundColor: C.surface }]}>
              <View style={{ flex: 1 }}>
                <View style={styles.toggleHeader}>
                  <Ionicons name="calendar" size={18} color="#3B82F6" />
                  <Text style={[styles.toggleLabel, { color: C.text }]}>
                    Set Deadline
                  </Text>
                </View>
                <Text style={[styles.toggleDesc, { color: C.textSecondary }]}>
                  Set a target date to reach your goal
                </Text>
              </View>
              <Switch
                value={form.hasDeadline}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    hasDeadline: v,
                    deadline: v ? new Date() : undefined,
                  })
                }
                trackColor={{ false: C.textSecondary, true: "#3B82F6" }}
              />
            </View>

            {/* Deadline Picker */}
            {form.hasDeadline && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: C.text }]}>
                  Target Date
                </Text>
                <TouchableOpacity
                  style={[styles.dateBtn, { backgroundColor: C.surface }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={C.icon} />
                  <Text style={[styles.dateText, { color: C.text }]}>
                    {form.deadline?.toLocaleDateString() || "Select date"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={form.deadline || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (date) setForm({ ...form, deadline: date });
                    }}
                  />
                )}
              </View>
            )}

            {/* Recurring Contribution Toggle */}
            <View style={[styles.toggleRow, { backgroundColor: C.surface }]}>
              <View style={{ flex: 1 }}>
                <View style={styles.toggleHeader}>
                  <Ionicons name="repeat" size={18} color="#F59E0B" />
                  <Text style={[styles.toggleLabel, { color: C.text }]}>
                    Recurring Contribution
                  </Text>
                </View>
                <Text style={[styles.toggleDesc, { color: C.textSecondary }]}>
                  Set up automatic contribution reminders
                </Text>
              </View>
              <Switch
                value={form.hasRecurring}
                onValueChange={(v) => setForm({ ...form, hasRecurring: v })}
                trackColor={{ false: C.textSecondary, true: "#F59E0B" }}
              />
            </View>

            {/* Contribution Settings */}
            {form.hasRecurring && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: C.text }]}>
                    Contribution Frequency
                  </Text>
                  <View style={styles.frequencyGrid}>
                    {FREQUENCIES.map((freq) => {
                      const selected =
                        form.contributionFrequency === freq.value;
                      return (
                        <TouchableOpacity
                          key={freq.value}
                          style={[
                            styles.freqBtn,
                            { backgroundColor: C.surface },
                            selected && {
                              backgroundColor: "#F59E0B" + "20",
                              borderColor: "#F59E0B",
                              borderWidth: 2,
                            },
                          ]}
                          onPress={() =>
                            setForm({
                              ...form,
                              contributionFrequency: freq.value,
                            })
                          }
                        >
                          <Ionicons
                            name={freq.icon}
                            size={16}
                            color={selected ? "#F59E0B" : C.icon}
                          />
                          <Text
                            style={[
                              styles.freqLabel,
                              { color: selected ? "#F59E0B" : C.text },
                            ]}
                          >
                            {freq.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: C.text }]}>
                    Contribution Amount
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: C.surface, color: C.text },
                    ]}
                    value={form.contributionAmount}
                    onChangeText={(v) =>
                      setForm({ ...form, contributionAmount: v })
                    }
                    placeholder="0.00"
                    placeholderTextColor={C.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: "#F59E0B" }]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="flag" size={20} color="#FFF" />
                  <Text style={styles.submitText}>Create Goal</Text>
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
  frequencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  freqBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: "45%",
    justifyContent: "center",
  },
  freqLabel: {
    fontSize: 12,
    fontWeight: "600",
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
