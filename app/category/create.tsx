import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
import { TransactionType } from "@/types/api.types";

const TX_TYPES: { label: string; value: TransactionType; color: string }[] = [
  { label: "Expense", value: "Expense", color: "#EF4444" },
  { label: "Income", value: "Income", color: "#22C55E" },
  { label: "Investment", value: "Investment", color: "#3B82F6" },
  { label: "Savings", value: "Savings", color: "#F59E0B" },
];

const PRESET_COLORS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#7C3AED",
  "#EC4899",
  "#6B7280",
  "#374151",
  "#1F2937",
  "#111827",
];

const PRESET_EMOJIS = [
  "🍔",
  "🏠",
  "🚗",
  "💊",
  "🎮",
  "✈️",
  "👗",
  "💰",
  "📈",
  "🎓",
  "🏋️",
  "🎵",
  "🛒",
  "💳",
  "🔧",
  "💼",
  "🌱",
  "🎁",
  "📱",
  "☕",
  "🎬",
  "🏦",
  "💡",
  "🌟",
];

export default function CreateCategoryScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: TransactionType }>();

  const [type, setType] = useState<TransactionType>(params.type ?? "Expense");
  const [displayName, setDisplayName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [color, setColor] = useState("#7C3AED");
  const [customColor, setCustomColor] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }
    const finalColor = customColor.trim() || color;
    if (!/^#[0-9A-Fa-f]{6}$/.test(finalColor)) {
      Alert.alert("Error", "Color must be a valid hex code (e.g. #FF5722)");
      return;
    }
    setSaving(true);
    try {
      await categoryService.createCategory({
        displayName: displayName.trim(),
        type,
        icon,
        color: finalColor,
      });
      Alert.alert("Success", "Category created!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create category";
      Alert.alert("Error", msg);
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
        <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Category</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Preview */}
          <View style={[styles.previewCard, { backgroundColor: C.surface }]}>
            <View
              style={[
                styles.previewIcon,
                { backgroundColor: (customColor.trim() || color) + "25" },
              ]}
            >
              <Text style={styles.previewEmoji}>{icon}</Text>
            </View>
            <Text style={[styles.previewName, { color: C.text }]}>
              {displayName || "Category Name"}
            </Text>
            <View
              style={[
                styles.previewPill,
                { backgroundColor: (customColor.trim() || color) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.previewPillText,
                  { color: customColor.trim() || color },
                ]}
              >
                {type}
              </Text>
            </View>
          </View>

          {/* Type */}
          <Text style={[styles.label, { color: C.text }]}>Type</Text>
          <View style={styles.typeRow}>
            {TX_TYPES.map((t) => {
              const active = t.value === type;
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
                  onPress={() => setType(t.value)}
                >
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

          {/* Name */}
          <Text style={[styles.label, { color: C.text }]}>Name</Text>
          <View
            style={[
              styles.inputWrapper,
              { borderColor: C.border, backgroundColor: C.surface },
            ]}
          >
            <TextInput
              style={[styles.input, { color: C.text }]}
              placeholder="e.g. Food & Dining"
              placeholderTextColor={C.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

          {/* Icon picker */}
          <Text style={[styles.label, { color: C.text }]}>Icon</Text>
          <View style={styles.emojiGrid}>
            {PRESET_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiBtn,
                  {
                    backgroundColor: icon === e ? C.tint + "20" : C.surface,
                    borderColor: icon === e ? C.tint : C.border,
                  },
                ]}
                onPress={() => setIcon(e)}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor: C.border,
                backgroundColor: C.surface,
                marginTop: 8,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: C.text }]}
              placeholder="Or type any emoji..."
              placeholderTextColor={C.textSecondary}
              value={icon}
              onChangeText={setIcon}
              maxLength={4}
            />
          </View>

          {/* Color picker */}
          <Text style={[styles.label, { color: C.text }]}>Color</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorBtn,
                  { backgroundColor: c },
                  color === c && styles.colorBtnActive,
                ]}
                onPress={() => {
                  setColor(c);
                  setCustomColor("");
                }}
              />
            ))}
          </View>
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor: C.border,
                backgroundColor: C.surface,
                marginTop: 8,
              },
            ]}
          >
            <Text
              style={[{ fontSize: 14, color: C.textSecondary, marginRight: 8 }]}
            >
              #
            </Text>
            <TextInput
              style={[styles.input, { color: C.text }]}
              placeholder="Custom hex (e.g. FF5722)"
              placeholderTextColor={C.textSecondary}
              value={customColor.replace("#", "")}
              onChangeText={(v) => setCustomColor("#" + v.replace("#", ""))}
              maxLength={7}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={{ marginTop: 20 }}
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
                  <Text style={styles.saveBtnText}>Create Category</Text>
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
  previewCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  previewEmoji: { fontSize: 30 },
  previewName: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  previewPill: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 16 },
  previewPillText: { fontSize: 13, fontWeight: "600" },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeBtnText: { fontSize: 12, fontWeight: "600" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  input: { flex: 1, fontSize: 15 },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
  colorBtnActive: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
