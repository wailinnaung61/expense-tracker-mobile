import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "document-text-outline",
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: C.tint + "15" }]}>
        <Ionicons name={icon as any} size={40} color={C.tint} />
      </View>
      <Text style={[styles.title, { color: C.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.tint }]}
          onPress={onAction}
        >
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  btn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
