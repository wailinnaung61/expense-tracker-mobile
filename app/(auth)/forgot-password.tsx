import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authService } from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleForgot() {
    if (!usernameOrEmail.trim()) {
      Alert.alert("Error", "Please enter your username or email");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(usernameOrEmail.trim());
      Alert.alert(
        "Code Sent",
        "If the account exists, a reset code has been sent to your email.",
        [
          {
            text: "Enter Code",
            onPress: () =>
              router.push({
                pathname: "/(auth)/reset-password",
                params: { usernameOrEmail: usernameOrEmail.trim() },
              }),
          },
        ],
      );
    } catch {
      Alert.alert("Error", "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-open" size={36} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Forgot Password?</Text>
          <Text style={styles.headerSub}>
            Enter your account details and{"\n"}we'll send you a reset code
          </Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: C.textSecondary }]}>
              Username or Email
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: C.border, backgroundColor: C.background },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={C.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Enter username or email"
                placeholderTextColor={C.textSecondary}
                value={usernameOrEmail}
                onChangeText={setUsernameOrEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleForgot}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.btn}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Send Reset Code</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backLink}
          >
            <Ionicons name="arrow-back" size={14} color={C.tint} />
            <Text
              style={{
                color: C.tint,
                fontWeight: "600",
                fontSize: 14,
                marginLeft: 4,
              }}
            >
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 40 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backBtn: { position: "absolute", top: 60, left: 20 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  fieldContainer: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15 },
  btn: {
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 8,
  },
});
