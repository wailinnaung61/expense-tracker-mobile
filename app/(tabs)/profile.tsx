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
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authService } from "@/services/auth.service";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { user, signOut, refreshUser } = useAuth();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    userName: user?.userName ?? "",
    email: user?.email ?? "",
  });
  const [saving, setSaving] = useState(false);

  const [changePwd, setChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await authService.updateProfile(form.userName.trim(), form.email.trim());
      await refreshUser();
      setEditMode(false);
      Alert.alert("Success", "Profile updated!");
    } catch {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (pwdForm.new !== pwdForm.confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setSavingPwd(true);
    try {
      await authService.changePassword(pwdForm.old, pwdForm.new);
      Alert.alert("Success", "Password changed!");
      setChangePwd(false);
      setPwdForm({ old: "", new: "", confirm: "" });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to change password";
      Alert.alert("Error", msg);
    } finally {
      setSavingPwd(false);
    }
  }

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  }

  const initials = (user?.userName ?? "U").slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={["#7C3AED", "#4F46E5"]}
          style={styles.headerGradient}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.userName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  user?.status === "ACTIVE" ? "#22C55E" : "#F59E0B",
              },
            ]}
          >
            <Text style={styles.statusText}>{user?.status ?? "ACTIVE"}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: C.surface }]}>
            <View style={styles.statItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={C.tint}
              />
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                Role
              </Text>
              <Text style={[styles.statValue, { color: C.text }]}>
                {user?.roleId ?? "USER"}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: C.border }]} />
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={20} color={C.tint} />
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                Daily Limit
              </Text>
              <Text style={[styles.statValue, { color: C.text }]}>
                {(user?.dailyLimit ?? 0).toLocaleString("en-US", {
                  style: "currency",
                  currency: user?.currency ?? "USD",
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: C.border }]} />
            <View style={styles.statItem}>
              <Ionicons name="globe-outline" size={20} color={C.tint} />
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                Currency
              </Text>
              <Text style={[styles.statValue, { color: C.text }]}>
                {user?.currency ?? "USD"}
              </Text>
            </View>
          </View>

          {/* Edit Profile */}
          <View style={[styles.card, { backgroundColor: C.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: C.text }]}>
                Profile Info
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (editMode) {
                    setForm({
                      userName: user?.userName ?? "",
                      email: user?.email ?? "",
                    });
                  }
                  setEditMode(!editMode);
                }}
              >
                <Text
                  style={{ color: C.tint, fontWeight: "600", fontSize: 14 }}
                >
                  {editMode ? "Cancel" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            {(["userName", "email"] as const).map((key) => (
              <View key={key} style={styles.field}>
                <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>
                  {key === "userName" ? "Username" : "Email"}
                </Text>
                {editMode ? (
                  <TextInput
                    style={[
                      styles.fieldInput,
                      {
                        color: C.text,
                        borderColor: C.border,
                        backgroundColor: C.background,
                      },
                    ]}
                    value={form[key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    keyboardType={key === "email" ? "email-address" : "default"}
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: C.text }]}>
                    {user?.[key] ?? "-"}
                  </Text>
                )}
              </View>
            ))}

            {editMode && (
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={saving}
                style={[styles.saveBtn, { backgroundColor: C.tint }]}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Change Password */}
          <View style={[styles.card, { backgroundColor: C.surface }]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setChangePwd(!changePwd)}
            >
              <Text style={[styles.cardTitle, { color: C.text }]}>
                Change Password
              </Text>
              <Ionicons
                name={changePwd ? "chevron-up" : "chevron-down"}
                size={18}
                color={C.textSecondary}
              />
            </TouchableOpacity>

            {changePwd && (
              <>
                {(
                  [
                    { key: "old", label: "Current Password" },
                    { key: "new", label: "New Password" },
                    { key: "confirm", label: "Confirm New Password" },
                  ] as const
                ).map(({ key, label }) => (
                  <View key={key} style={styles.field}>
                    <Text
                      style={[styles.fieldLabel, { color: C.textSecondary }]}
                    >
                      {label}
                    </Text>
                    <View
                      style={[
                        styles.pwdWrapper,
                        {
                          borderColor: C.border,
                          backgroundColor: C.background,
                        },
                      ]}
                    >
                      <TextInput
                        style={[styles.pwdInput, { color: C.text }]}
                        placeholder="••••••••"
                        placeholderTextColor={C.textSecondary}
                        value={pwdForm[key]}
                        onChangeText={(v) =>
                          setPwdForm((f) => ({ ...f, [key]: v }))
                        }
                        secureTextEntry={!showPwd}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={() => setShowPwd((s) => !s)}
                  style={styles.showPwdBtn}
                >
                  <Ionicons
                    name={showPwd ? "eye-off-outline" : "eye-outline"}
                    size={16}
                    color={C.textSecondary}
                  />
                  <Text
                    style={{
                      color: C.textSecondary,
                      fontSize: 13,
                      marginLeft: 4,
                    }}
                  >
                    {showPwd ? "Hide" : "Show"} passwords
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={savingPwd}
                  style={[styles.saveBtn, { backgroundColor: C.tint }]}
                >
                  {savingPwd ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* MFA / Settings info */}
          <View style={[styles.card, { backgroundColor: C.surface }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Security</Text>
            <View style={styles.infoRow}>
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color={C.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: C.textSecondary }]}>
                MFA
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: user?.mfaEnabled
                      ? C.success + "20"
                      : C.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: user?.mfaEnabled ? C.success : C.textSecondary,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {user?.mfaEnabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
          </View>

          {/* Sign out */}
          <TouchableOpacity
            style={[styles.signOutBtn, { borderColor: C.error }]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={18} color={C.error} />
            <Text style={[styles.signOutText, { color: C.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerGradient: { paddingTop: 24, paddingBottom: 32, alignItems: "center" },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  name: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 4 },
  email: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 10 },
  statusPill: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  body: { padding: 16 },
  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, alignSelf: "stretch" },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  fieldValue: { fontSize: 15 },
  fieldInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
  },
  pwdWrapper: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
  },
  pwdInput: { fontSize: 15, flex: 1 },
  showPwdBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  saveBtn: {
    borderRadius: 12,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoLabel: { flex: 1, fontSize: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    height: 50,
    marginBottom: 40,
  },
  signOutText: { fontWeight: "700", fontSize: 15 },
});
