import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: any;
  color?: string;
}

export function FloatingActionButton({
  onPress,
  icon = "add",
  color = "#7C3AED",
}: FloatingActionButtonProps) {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: color }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={28} color="#FFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 90 : 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
