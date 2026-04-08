import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Card, Button } from "@/components/ui";
import { useAuthStore, useProfileStore } from "@/stores";
import { useTranslation, LANGUAGE_OPTIONS, SupportedLanguage } from "@/hooks/useTranslation";
import { Colors } from "@/constants/theme";
import { SUPPORTED_CURRENCIES } from "@/types/profile.types";

export default function ProfileScreen() {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const { user, signOut } = useAuthStore();
  const { profile, isLoading, fetchProfile, updateNotificationLocale, updateCurrency } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleNotificationLanguageChange = async (locale: SupportedLanguage) => {
    try {
      await updateNotificationLocale(locale);
    } catch (error) {
      console.error("Failed to update notification language:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const notificationLocale = profile?.locale as SupportedLanguage || "en";
  const currency = profile?.currency || "USD";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <Card style={styles.userCard} variant="elevated">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.userName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.userName}>{profile?.userName || user?.email || "User"}</Text>
        <Text style={styles.userEmail}>{profile?.email || user?.email || ""}</Text>
      </Card>

      {/* Settings Sections */}
      <Text style={styles.sectionTitle}>{t("profile.settings")}</Text>

      {isLoading && !profile ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      ) : (
        <>
          {/* App Language (UI) */}
          <Card style={styles.settingCard}>
            <Text style={styles.settingLabel}>{t("profile.appLanguage")}</Text>
            <View style={styles.languageOptions}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={[
                    styles.languageButton,
                    currentLanguage === lang.value && styles.languageButtonActive,
                  ]}
                  onPress={() => changeLanguage(lang.value)}
                >
                  <Text
                    style={[
                      styles.languageText,
                      currentLanguage === lang.value && styles.languageTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Notification Language (Backend) */}
          <Card style={styles.settingCard}>
            <Text style={styles.settingLabel}>{t("profile.notificationLanguage")}</Text>
            <Text style={styles.settingHint}>{t("profile.notificationLanguageHint")}</Text>
            <View style={styles.languageOptions}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={[
                    styles.languageButton,
                    notificationLocale === lang.value && styles.languageButtonActive,
                  ]}
                  onPress={() => handleNotificationLanguageChange(lang.value)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.languageText,
                      notificationLocale === lang.value && styles.languageTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Currency */}
          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t("profile.currency")}</Text>
              <Text style={styles.settingValue}>
                {SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol} {currency}
              </Text>
            </View>
          </Card>
        </>
      )}

      {/* About */}
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t("profile.version")}</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </Card>

      {/* Logout */}
      <Button
        variant="danger"
        size="lg"
        fullWidth
        onPress={handleSignOut}
        style={styles.logoutButton}
      >
        {t("profile.logout")}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
  },
  userCard: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  settingCard: {
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  settingHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  languageOptions: {
    flexDirection: "row",
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  languageTextActive: {
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
    color: "#FFFFFF",
  },
  logoutButton: {
    marginTop: 24,
  },
});
