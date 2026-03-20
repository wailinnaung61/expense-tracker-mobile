import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingView({ fullScreen = false }: { fullScreen?: boolean }) {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: C.background },
      ]}
    >
      <ActivityIndicator size="large" color={C.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: 40 },
  fullScreen: { flex: 1 },
});
