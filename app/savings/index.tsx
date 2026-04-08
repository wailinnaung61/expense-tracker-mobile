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
import { useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { savingsService } from "@/services/savings.service";
import type { SavingGoalDto } from "@/types/savings.types";

export default function SavingsGoalsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { user } = useAuth();
  const router = useRouter();

  const [goals, setGoals] = useState<SavingGoalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currency = user?.currency ?? "USD";

  const load = useCallback(async () => {
    try {
      const data = await savingsService.getAllGoals();
      setGoals(data);
    } catch (err) {
      console.error("Error loading goals:", err);
      Alert.alert("Error", "Failed to load savings goals");
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

  const activeGoals = goals.filter((g) => g.status === "Active");
  const completedGoals = goals.filter((g) => g.status === "Completed");
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);

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
          colors={["#F59E0B", "#D97706"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Savings Goals</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Saved</Text>
              <Text style={styles.summaryValue}>
                {totalSaved.toLocaleString("en-US", {
                  style: "currency",
                  currency,
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Target</Text>
              <Text style={styles.summaryValue}>
                {totalTarget.toLocaleString("en-US", {
                  style: "currency",
                  currency,
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="flag" size={20} color={C.tint} />
                <Text style={[styles.sectionTitle, { color: C.text }]}>
                  Active Goals
                </Text>
              </View>
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.savingGoalId}
                  goal={goal}
                  colorScheme={colorScheme}
                  currency={currency}
                  onPress={() =>
                    router.push({
                      pathname: "/savings/[id]" as any,
                      params: { id: goal.savingGoalId },
                    })
                  }
                />
              ))}
            </>
          )}

          {/* Empty State */}
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <View style={[styles.emptyCard, { backgroundColor: C.surface }]}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={[styles.emptyTitle, { color: C.text }]}>
                No Savings Goals Yet
              </Text>
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                Set financial goals and track your progress to achieve them!
              </Text>
            </View>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={[styles.sectionTitle, { color: C.text }]}>
                  Completed Goals ({completedGoals.length})
                </Text>
              </View>
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.savingGoalId}
                  goal={goal}
                  colorScheme={colorScheme}
                  currency={currency}
                  onPress={() =>
                    router.push({
                      pathname: "/savings/[id]" as any,
                      params: { id: goal.savingGoalId },
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
        onPress={() => router.push("/savings/create" as any)}
        icon="add"
        color="#F59E0B"
      />
    </SafeAreaView>
  );
}

interface GoalCardProps {
  goal: SavingGoalDto;
  colorScheme: "light" | "dark";
  currency: string;
  onPress: () => void;
}

function GoalCard({ goal, colorScheme, currency, onPress }: GoalCardProps) {
  const C = Colors[colorScheme];

  const progress = goal.progress;
  const isCompleted = goal.status === "Completed";
  const hasDeadline = !!goal.deadline;
  const isOverdue =
    hasDeadline &&
    !isCompleted &&
    goal.daysRemaining !== null &&
    goal.daysRemaining < 0;
  const isNearDeadline =
    hasDeadline &&
    !isCompleted &&
    goal.daysRemaining !== null &&
    goal.daysRemaining <= 30 &&
    goal.daysRemaining >= 0;

  let statusColor = "#F59E0B";
  let statusIcon: any = "time-outline";
  let statusText = "In Progress";

  if (isCompleted) {
    statusColor = "#22C55E";
    statusIcon = "checkmark-circle";
    statusText = "Completed";
  } else if (isOverdue) {
    statusColor = "#EF4444";
    statusIcon = "alert-circle";
    statusText = "Overdue";
  } else if (isNearDeadline) {
    statusColor = "#F59E0B";
    statusIcon = "warning";
    statusText = `${goal.daysRemaining}d left`;
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: C.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.goalName, { color: C.text }]}>
            {goal.goalName}
          </Text>
          <View style={styles.badge}>
            <Ionicons name={statusIcon} size={12} color={statusColor} />
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.goalAmount, { color: C.text }]}>
            {goal.currentAmount.toLocaleString("en-US", {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            })}
          </Text>
          <Text style={[styles.goalTarget, { color: C.textSecondary }]}>
            of{" "}
            {goal.targetAmount.toLocaleString("en-US", {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: C.background }]}>
        <LinearGradient
          colors={
            isCompleted
              ? ["#22C55E", "#16A34A"]
              : isOverdue
                ? ["#EF4444", "#DC2626"]
                : ["#F59E0B", "#D97706"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressFill,
            { width: `${Math.min(progress, 100)}%` },
          ]}
        />
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.progressText, { color: C.text }]}>
            {progress.toFixed(0)}% Complete
          </Text>
          {hasDeadline && (
            <Text style={[styles.deadlineText, { color: C.textSecondary }]}>
              Due: {format(parseISO(goal.deadline!), "MMM d, yyyy")}
            </Text>
          )}
        </View>
        {goal.contributionFrequency && goal.contributionAmount && (
          <View
            style={[styles.contributionTag, { backgroundColor: C.background }]}
          >
            <Ionicons name="repeat" size={12} color={C.textSecondary} />
            <Text style={[styles.contributionText, { color: C.textSecondary }]}>
              {goal.contributionAmount.toLocaleString("en-US", {
                style: "currency",
                currency,
                maximumFractionDigits: 0,
              })}{" "}
              / {goal.contributionFrequency}
            </Text>
          </View>
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
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 16,
  },
  body: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
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
    marginBottom: 12,
  },
  goalName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  goalAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  goalTarget: {
    fontSize: 12,
    marginTop: 2,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
  },
  deadlineText: {
    fontSize: 11,
    marginTop: 2,
  },
  contributionTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contributionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginTop: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
