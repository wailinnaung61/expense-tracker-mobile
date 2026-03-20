import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authService } from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function ConfirmScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { confirmSignUp } = useAuth();
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleConfirm() {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the confirmation code");
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(username ?? "", code.trim());
      Alert.alert("Success", "Account confirmed! Please sign in.", [
        { text: "Sign In", onPress: () => router.replace("/(auth)/sign-in") },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Confirmation failed";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await authService.resendConfirmation(username ?? "");
      Alert.alert("Sent", "Confirmation code resent to your email.");
    } catch {
      Alert.alert("Error", "Failed to resend code.");
    } finally {
      setResending(false);
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
      >
        <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-open" size={36} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Check Your Email</Text>
          <Text style={styles.headerSub}>
            We sent a code to your email{"\n"}Enter it below to verify your
            account
          </Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: C.surface }]}>
          {username ? (
            <View
              style={[styles.usernamePill, { backgroundColor: C.background }]}
            >
              <Ionicons name="person-circle-outline" size={16} color={C.tint} />
              <Text style={[styles.usernameText, { color: C.text }]}>
                {" "}
                {username}
              </Text>
            </View>
          ) : null}

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: C.textSecondary }]}>
              Confirmation Code
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: C.border, backgroundColor: C.background },
              ]}
            >
              <Ionicons
                name="key-outline"
                size={18}
                color={C.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={C.textSecondary}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={8}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.btn}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Verify Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResend}
            disabled={resending}
            style={styles.resendBtn}
          >
            {resending ? (
              <ActivityIndicator size="small" color={C.tint} />
            ) : (
              <Text style={{ color: C.tint, fontWeight: "600", fontSize: 14 }}>
                Resend Code
              </Text>
            )}
          </TouchableOpacity>
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
  usernamePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  usernameText: { fontSize: 14, fontWeight: "600" },
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
  input: { flex: 1, fontSize: 18, letterSpacing: 4, textAlign: "center" },
  btn: {
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resendBtn: { alignItems: "center", marginTop: 20, padding: 8 },
});
