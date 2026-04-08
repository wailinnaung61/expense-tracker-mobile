import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Button, Input, ErrorMessage } from "@/components/ui";
import { useAuthStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { Colors } from "@/constants/theme";

export default function MfaScreen() {
  const { t } = useTranslation();
  const { verifyMfa, mfaUsername, isLoading, error } = useAuthStore();
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    if (mfaUsername) {
      await verifyMfa(code);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth.mfaRequired")}</Text>
          <Text style={styles.subtitle}>{t("auth.mfaDescription")}</Text>
        </View>

        {error && <ErrorMessage message={error} />}

        <View style={styles.form}>
          <Input
            label={t("auth.mfaCode")}
            placeholder={t("auth.enterMfaCode")}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="sms-otp"
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleVerify}
          >
            {t("auth.verifyCode")}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  form: {
    gap: 24,
  },
});
