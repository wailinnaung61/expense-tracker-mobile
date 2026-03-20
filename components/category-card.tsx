import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Category } from "@/types/api.types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  category: Category;
  onPress?: () => void;
  onLongPress?: () => void;
  count?: number;
  total?: number;
}

export function CategoryCard({
  category,
  onPress,
  onLongPress,
  count,
  total,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const bg = (category.color ?? "#7C3AED") + "20";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.surface, shadowColor: "#000" }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconBubble, { backgroundColor: bg }]}>
        <Text style={styles.icon}>{category.icon ?? "📁"}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: C.text }]} numberOfLines={1}>
          {category.displayName}
        </Text>
        <View style={styles.row}>
          <View
            style={[
              styles.typePill,
              { backgroundColor: typeColor(category.type) + "20" },
            ]}
          >
            <Text
              style={[styles.typeText, { color: typeColor(category.type) }]}
            >
              {category.type}
            </Text>
          </View>
          {count !== undefined && (
            <Text style={[styles.meta, { color: C.textSecondary }]}>
              {count} tx
            </Text>
          )}
        </View>
      </View>
      {total !== undefined && (
        <Text style={[styles.total, { color: C.text }]}>
          {total.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })}
        </Text>
      )}
      <View
        style={[
          styles.colorBar,
          { backgroundColor: category.color ?? "#7C3AED" },
        ]}
      />
    </TouchableOpacity>
  );
}

function typeColor(type: string) {
  const map: Record<string, string> = {
    Income: "#22C55E",
    Expense: "#EF4444",
    Investment: "#3B82F6",
    Savings: "#F59E0B",
  };
  return map[type] ?? "#7C3AED";
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  icon: { fontSize: 22 },
  content: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeText: { fontSize: 11, fontWeight: "600" },
  meta: { fontSize: 12 },
  total: { fontSize: 14, fontWeight: "700", marginRight: 8 },
  colorBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
});
