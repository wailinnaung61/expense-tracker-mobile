import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { FloatingActionButton } from "@/components/floating-action-button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { recurringPaymentService } from "@/services/recurring.service";
import type {
    RecurringFrequency,
    RecurringPaymentDto,
} from "@/types/recurring.types";

const FREQUENCY_ICONS: Record<RecurringFrequency, string> = {
  Daily: "today",
  Weekly: "calendar",
  Monthly: "calendar-outline",
  Yearly: "calendar-number-outline",
};

const FREQUENCY_COLORS: Record<RecurringFrequency, string> = {
  Daily: "#EF4444",
  Weekly: "#F59E0B",
  Monthly: "#3B82F6",
  Yearly: "#8B5CF6",
};

export default function RecurringPaymentsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const router = useRouter();

  const [payments, setPayments] = useState<RecurringPaymentDto[]>([]);
  const [upcoming, setUpcoming] = useState<RecurringPaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [allPayments, upcomingPayments] = await Promise.all([
        recurringPaymentService.getAllPayments(),
        recurringPaymentService.getUpcomingPayments(),
      ]);
      setPayments(allPayments);
      setUpcoming(upcomingPayments);
    } catch (err) {
      console.error("Error loading recurring payments:", err);
      Alert.alert("Error", "Failed to load recurring payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  async function handleProcessPayment(payment: RecurringPaymentDto) {
    Alert.alert("Process Payment", `Mark "${payment.name}" as paid?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Paid",
        onPress: async () => {
          setProcessing(payment.recurringPaymentId);
          try {
            await recurringPaymentService.processPayment(
              payment.recurringPaymentId,
              {
                paidDate: new Date().toISOString().split("T")[0],
                amount: payment.amount,
              },
            );
            Alert.alert("Success", "Payment processed!");
            load();
          } catch (err: any) {
            Alert.alert(
              "Error",
              err?.response?.data?.message ?? "Failed to process payment",
            );
          } finally {
            setProcessing(null);
          }
        },
      },
    ]);
  }

  async function handleSkipPayment(payment: RecurringPaymentDto) {
    Alert.alert("Skip Payment", `Skip "${payment.name}" this time?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Skip",
        style: "destructive",
        onPress: async () => {
          try {
            await recurringPaymentService.skipPayment(
              payment.recurringPaymentId,
            );
            Alert.alert("Success", "Payment skipped!");
            load();
          } catch (err: any) {
            Alert.alert(
              "Error",
              err?.response?.data?.message ?? "Failed to skip payment",
            );
          }
        },
      },
    ]);
  }

  async function handleToggleActive(payment: RecurringPaymentDto) {
    try {
      await recurringPaymentService.updatePayment(payment.recurringPaymentId, {
        isActive: !payment.isActive,
      });
      load();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "Failed to update payment",
      );
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={C.tint} />
        </View>
      </SafeAreaView>
    );
  }

  const activePayments = payments.filter((p) => p.isActive);
  const inactivePayments = payments.filter((p) => !p.isActive);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.tint}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={["#8B5CF6", "#6D28D9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Recurring Payments</Text>
          <Text style={styles.headerSubtitle}>
            {activePayments.length} active · {upcoming.length} due soon
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Upcoming Section */}
          {upcoming.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="alarm" size={20} color={C.tint} />
                <Text style={[styles.sectionTitle, { color: C.text }]}>
                  Due Soon (Next 30 Days)
                </Text>
              </View>
              {upcoming.map((payment) => (
                <RecurringPaymentCard
                  key={payment.recurringPaymentId}
                  payment={payment}
                  colorScheme={colorScheme}
                  processing={processing === payment.recurringPaymentId}
                  onProcess={() => handleProcessPayment(payment)}
                  onSkip={() => handleSkipPayment(payment)}
                  onToggleActive={() => handleToggleActive(payment)}
                  onPress={() =>
                    router.push({
                      pathname: "/recurring/[id]" as any,
                      params: { id: payment.recurringPaymentId },
                    })
                  }
                />
              ))}
            </>
          )}

          {/* Active Payments */}
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              Active Payments
            </Text>
          </View>
          {activePayments.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: C.surface }]}>
              <Ionicons name="repeat" size={32} color={C.textSecondary} />
              <Text style={[{ color: C.textSecondary, marginTop: 8 }]}>
                No recurring payments yet
              </Text>
              <Text
                style={[
                  {
                    color: C.textSecondary,
                    fontSize: 13,
                    marginTop: 4,
                    textAlign: "center",
                  },
                ]}
              >
                Set up automatic tracking for rent, subscriptions, salary
              </Text>
            </View>
          ) : (
            activePayments.map((payment) => (
              <RecurringPaymentCard
                key={payment.recurringPaymentId}
                payment={payment}
                colorScheme={colorScheme}
                processing={processing === payment.recurringPaymentId}
                onProcess={() => handleProcessPayment(payment)}
                onSkip={() => handleSkipPayment(payment)}
                onToggleActive={() => handleToggleActive(payment)}
                onPress={() =>
                  router.push({
                    pathname: "/recurring/[id]" as any,
                    params: { id: payment.recurringPaymentId },
                  })
                }
              />
            ))
          )}

          {/* Inactive Payments */}
          {inactivePayments.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="pause-circle"
                  size={20}
                  color={C.textSecondary}
                />
                <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>
                  Paused
                </Text>
              </View>
              {inactivePayments.map((payment) => (
                <RecurringPaymentCard
                  key={payment.recurringPaymentId}
                  payment={payment}
                  colorScheme={colorScheme}
                  processing={false}
                  onProcess={() => {}}
                  onSkip={() => {}}
                  onToggleActive={() => handleToggleActive(payment)}
                  onPress={() =>
                    router.push({
                      pathname: "/recurring/[id]" as any,
                      params: { id: payment.recurringPaymentId },
                    })
                  }
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <FloatingActionButton
        onPress={() => router.push("/recurring/create" as any)}
        icon="repeat"
        color="#8B5CF6"
      />
    </SafeAreaView>
  );
}

interface RecurringPaymentCardProps {
  payment: RecurringPaymentDto;
  colorScheme: "light" | "dark";
  processing: boolean;
  onProcess: () => void;
  onSkip: () => void;
  onToggleActive: () => void;
  onPress: () => void;
}

function RecurringPaymentCard({
  payment,
  colorScheme,
  processing,
  onProcess,
  onSkip,
  onToggleActive,
  onPress,
}: RecurringPaymentCardProps) {
  const C = Colors[colorScheme];
  const freqColor = FREQUENCY_COLORS[payment.frequency];
  const freqIcon = FREQUENCY_ICONS[payment.frequency] as any;

  const dueDate = parseISO(payment.nextDueDate);
  const today = new Date();
  const daysUntil = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isOverdue = daysUntil < 0;
  const isDueSoon = daysUntil <= 7 && daysUntil >= 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: C.surface },
        !payment.isActive && { opacity: 0.6 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconCircle, { backgroundColor: freqColor + "20" }]}
        >
          <Ionicons name={freqIcon} size={20} color={freqColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: C.text }]}>
            {payment.name}
          </Text>
          <Text style={[styles.cardCategory, { color: C.textSecondary }]}>
            {payment.categoryName}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.cardAmount, { color: C.text }]}>
            ${payment.amount.toFixed(2)}
          </Text>
          <View style={[styles.badge, { backgroundColor: freqColor + "20" }]}>
            <Text style={[styles.badgeText, { color: freqColor }]}>
              {payment.frequency}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <Text style={[{ color: C.textSecondary, fontSize: 12 }]}>
            Next: {format(dueDate, "MMM d, yyyy")}
            {isOverdue && (
              <Text style={{ color: "#EF4444", fontWeight: "600" }}>
                {" "}
                (Overdue)
              </Text>
            )}
            {isDueSoon && (
              <Text style={{ color: "#F59E0B", fontWeight: "600" }}>
                {" "}
                (In {daysUntil}d)
              </Text>
            )}
          </Text>
          {payment.lastPaidDate && (
            <Text
              style={[{ color: C.textSecondary, fontSize: 11, marginTop: 2 }]}
            >
              Last paid: {format(parseISO(payment.lastPaidDate), "MMM d")}
            </Text>
          )}
          {payment.isAutoPayment && (
            <View style={styles.autoTag}>
              <Ionicons name="flash" size={10} color="#3B82F6" />
              <Text style={[styles.autoText, { color: "#3B82F6" }]}>Auto</Text>
            </View>
          )}
        </View>

        {payment.isActive && (
          <View style={styles.actions}>
            {processing ? (
              <ActivityIndicator size="small" color={C.tint} />
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: "#22C55E" + "20" },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onProcess();
                  }}
                >
                  <Ionicons name="checkmark" size={16} color="#22C55E" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: "#F59E0B" + "20" },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onSkip();
                  }}
                >
                  <Ionicons name="play-forward" size={16} color="#F59E0B" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: C.textSecondary + "20" },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onToggleActive();
              }}
            >
              <Ionicons name="pause" size={16} color={C.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {!payment.isActive && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#22C55E" + "20" }]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleActive();
            }}
          >
            <Ionicons name="play" size={16} color="#22C55E" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  body: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  autoTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  autoText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 8,
  },
});
