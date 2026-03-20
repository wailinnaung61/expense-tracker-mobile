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
import { Category } from "@/types/api.types";

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

export default function EditCategoryScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [color, setColor] = useState("#7C3AED");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [id]);

  async function loadCategory() {
    if (!id) return;
    try {
      const data = await categoryService.getCategoryById(id);
      setCategory(data);
      setDisplayName(data.displayName);
      setIcon(data.icon);
      setColor(data.color);
    } catch {
      Alert.alert("Error", "Failed to load category", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!displayName.trim()) {
      Alert.alert("Error", "Enter a category name");
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      Alert.alert("Error", "Invalid hex color");
      return;
    }
    setSaving(true);
    try {
      await categoryService.updateCategory(id!, {
        displayName: displayName.trim(),
        icon,
        color,
      });
      Alert.alert("Success", "Category updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      `Delete "${displayName}"?`,
      "This will also affect related transactions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await categoryService.deleteCategory(id!);
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete");
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingView fullScreen />;
  if (!category) return null;

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
          <Text style={styles.headerTitle}>Edit Category</Text>
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
              style={[styles.previewIcon, { backgroundColor: color + "25" }]}
            >
              <Text style={styles.previewEmoji}>{icon}</Text>
            </View>
            <Text style={[styles.previewName, { color: C.text }]}>
              {displayName || "Category Name"}
            </Text>
            <View
              style={[styles.previewPill, { backgroundColor: color + "20" }]}
            >
              <Text style={[styles.previewPillText, { color }]}>
                {category.type}
              </Text>
            </View>
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
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Category name"
              placeholderTextColor={C.textSecondary}
            />
          </View>

          {/* Icon */}
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

          {/* Color */}
          <Text style={[styles.label, { color: C.text }]}>Color</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorBtn,
                  { backgroundColor: c },
                  color === c && styles.colorActive,
                ]}
                onPress={() => setColor(c)}
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
              style={{ fontSize: 14, color: C.textSecondary, marginRight: 8 }}
            >
              #
            </Text>
            <TextInput
              style={[styles.input, { color: C.text }]}
              value={color.replace("#", "")}
              onChangeText={(v) => setColor("#" + v.replace("#", ""))}
              placeholder="Custom hex color"
              placeholderTextColor={C.textSecondary}
              maxLength={7}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{ marginTop: 20 }}
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
                  Delete Category
                </Text>
              </>
            )}
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
    marginBottom: 16,
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
  colorActive: {
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
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    height: 48,
    marginTop: 12,
  },
  deleteBtnText: { fontWeight: "700", fontSize: 14 },
});
