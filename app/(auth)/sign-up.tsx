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

export default function SignUpScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { signUp } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signUp(form.username.trim(), form.email.trim(), form.password);
      router.push({
        pathname: "/(auth)/confirm",
        params: { username: form.username.trim() },
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Sign up failed";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }

  const field = (
    label: string,
    key: keyof typeof form,
    icon: string,
    opts?: { secure?: boolean; keyboard?: "email-address" | "default" },
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          { borderColor: C.border, backgroundColor: C.background },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={C.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: C.text }]}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={C.textSecondary}
          value={form[key]}
          onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
          autoCapitalize={
            key === "email" || key === "password" || key === "confirmPassword"
              ? "none"
              : "none"
          }
          keyboardType={opts?.keyboard ?? "default"}
          secureTextEntry={opts?.secure && !showPwd}
        />
        {opts?.secure && (
          <TouchableOpacity onPress={() => setShowPwd((s) => !s)}>
            <Ionicons
              name={showPwd ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={C.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
        <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={36} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSub}>
            Start tracking your finances today
          </Text>
        </LinearGradient>

        <View style={[styles.formCard, { backgroundColor: C.surface }]}>
          {field("Username", "username", "person-outline")}
          {field("Email", "email", "mail-outline", {
            keyboard: "email-address",
          })}
          {field("Password", "password", "lock-closed-outline", {
            secure: true,
          })}
          {field(
            "Confirm Password",
            "confirmPassword",
            "shield-checkmark-outline",
            { secure: true },
          )}

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={["#7C3AED", "#4F46E5"]}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: C.textSecondary, fontSize: 14 }}>
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-in">
              <Text style={{ color: C.tint, fontWeight: "600", fontSize: 14 }}>
                Sign In
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
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backBtn: { position: "absolute", top: 60, left: 20 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  formCard: {
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
  fieldContainer: { marginBottom: 14 },
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
  submitBtn: {
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
});
