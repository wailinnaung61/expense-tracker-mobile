import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignInScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { signIn } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!form.usernameOrEmail.trim() || !form.password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn(form.usernameOrEmail.trim(), form.password);
      if (result.requiresMfa) {
        Alert.alert("MFA Required", "Please complete MFA verification.");
      }
      // Navigation handled by root layout auth guard
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Sign in failed. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={["#7C3AED", "#4F46E5"]}
          style={styles.headerGradient}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="wallet" size={40} color="#fff" />
            </View>
            <Text style={styles.appName}>ExpenseTracker</Text>
            <Text style={styles.tagline}>Smart money management</Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: C.surface, shadowColor: "#000" },
          ]}
        >
          <Text style={[styles.title, { color: C.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            Sign in to your account
          </Text>

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
                name="person-outline"
                size={18}
                color={C.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Enter username or email"
                placeholderTextColor={C.textSecondary}
                value={form.usernameOrEmail}
                onChangeText={(v) =>
                  setForm((f) => ({ ...f, usernameOrEmail: v }))
                }
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: C.textSecondary }]}>
              Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: C.border, backgroundColor: C.background },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={C.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Enter password"
                placeholderTextColor={C.textSecondary}
                value={form.password}
                onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={C.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            style={styles.forgotLink}
          >
            <Text style={{ color: C.tint, fontSize: 13, fontWeight: "500" }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: C.textSecondary, fontSize: 14 }}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-up">
              <Text style={{ color: C.tint, fontWeight: "600", fontSize: 14 }}>
                Sign Up
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  headerGradient: { paddingTop: 70, paddingBottom: 50, alignItems: "center" },
  logoContainer: { alignItems: "center" },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  formCard: {
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  fieldContainer: { marginBottom: 16 },
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
  eyeBtn: { padding: 4 },
  forgotLink: { alignSelf: "flex-end", marginBottom: 20 },
  submitBtn: {
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
});
