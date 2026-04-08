import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { exportService } from "@/services/export.service";
import type { Transaction } from "@/types/api.types";

interface ExportButtonProps {
  transactions: Transaction[];
  month?: string;
  summary?: {
    income: number;
    expense: number;
    savings: number;
    investment: number;
    transactions: Transaction[];
  };
  currency: string;
}

export function ExportButton({
  transactions,
  month,
  summary,
  currency,
}: ExportButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExportCSV() {
    setExporting(true);
    try {
      await exportService.exportTransactionsToCSV(transactions);
      setShowModal(false);
      Alert.alert("Success", "Transactions exported successfully!");
    } catch (err: any) {
      Alert.alert(
        "Export Failed",
        err?.message ?? "Failed to export transactions",
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleExportSummary() {
    if (!month || !summary) {
      Alert.alert("Error", "Monthly summary data not available");
      return;
    }
    setExporting(true);
    try {
      await exportService.exportMonthlySummary(month, summary, currency);
      setShowModal(false);
      Alert.alert("Success", "Summary exported successfully!");
    } catch (err: any) {
      Alert.alert("Export Failed", err?.message ?? "Failed to export summary");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: C.tint + "20" }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="download-outline" size={20} color={C.tint} />
        <Text style={[styles.buttonText, { color: C.tint }]}>Export</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <Pressable
            style={[styles.modal, { backgroundColor: C.card }]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.text }]}>
                Export Data
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: C.textSecondary }]}>
              Choose export format:
            </Text>

            {exporting ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={C.tint} />
                <Text style={[styles.loadingText, { color: C.textSecondary }]}>
                  Exporting...
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.option, { backgroundColor: C.surface }]}
                  onPress={handleExportCSV}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      { backgroundColor: "#22C55E" + "20" },
                    ]}
                  >
                    <Ionicons name="document-text" size={24} color="#22C55E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: C.text }]}>
                      CSV Spreadsheet
                    </Text>
                    <Text
                      style={[styles.optionDesc, { color: C.textSecondary }]}
                    >
                      Export {transactions.length} transactions to CSV format
                      for Excel
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={C.textSecondary}
                  />
                </TouchableOpacity>

                {month && summary && (
                  <TouchableOpacity
                    style={[styles.option, { backgroundColor: C.surface }]}
                    onPress={handleExportSummary}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: "#3B82F6" + "20" },
                      ]}
                    >
                      <Ionicons name="stats-chart" size={24} color="#3B82F6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionTitle, { color: C.text }]}>
                        Monthly Summary
                      </Text>
                      <Text
                        style={[styles.optionDesc, { color: C.textSecondary }]}
                      >
                        Export detailed monthly report with analytics
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={C.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  loading: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});
