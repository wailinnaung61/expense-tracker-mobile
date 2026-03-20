import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";

function InitialLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colorScheme === "dark" ? "#0A0A1A" : "#F1F5F9",
        }}
      >
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="transaction/create"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="transaction/[id]"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="category/create"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="category/[id]"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <InitialLayout />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
