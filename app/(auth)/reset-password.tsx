import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authService } from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();
  const { usernameOrEmail } = useLocalSearchParams<{
    usernameOrEmail: string;
  }>();

  const [form, setForm] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!form.code.trim() || !form.newPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(
        usernameOrEmail ?? "",
        form.code.trim(),
        form.newPassword,
      );
      Alert.alert("Success", "Password reset successfully. Please sign in.", [
        { text: "Sign In", onPress: () => router.replace("/(auth)/sign-in") },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Reset failed";
      Alert.alert("Error", msg);
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
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSub}>
            Enter the code from your email{"\n"}and set a new password
          </Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: C.surface }]}>
          {[
            {
              label: "Reset Code",
              key: "code",
              icon: "key-outline",
              keyboard: "number-pad" as const,
            },
            {
              label: "New Password",
              key: "newPassword",
              icon: "lock-closed-outline",
              secure: true,
            },
            {
              label: "Confirm Password",
              key: "confirmPassword",
              icon: "shield-checkmark-outline",
              secure: true,
            },
          ].map(({ label, key, icon, keyboard, secure }) => (
            <View key={key} style={styles.fieldContainer}>
              <Text style={[styles.label, { color: C.textSecondary }]}>
                {label}
              </Text>
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
                  value={form[key as keyof typeof form]}
                  onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                  keyboardType={keyboard ?? "default"}
                  secureTextEntry={secure && !showPwd}
                  autoCapitalize="none"
                />
                {secure && (
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
          ))}

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={["#7C3AED", "#4F46E5"]} style={styles.btn}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Reset Password</Text>
              )}
            </LinearGradient>
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
  btn: {
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
