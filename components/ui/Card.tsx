import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { Colors } from "@/constants/theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "elevated";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        variant === "elevated" && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
