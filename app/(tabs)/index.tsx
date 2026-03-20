import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { LoadingView } from "@/components/loading-view";
import { TransactionCard } from "@/components/transaction-card";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth.context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { aggregationService } from "@/services/aggregation.service";
import { transactionService } from "@/services/transaction.service";
import { AggregationData, Transaction } from "@/types/api.types";

const { width } = Dimensions.get("window");

const QUICK_ACTIONS = [
  {
    label: "Expense",
    type: "Expense",
    icon: "arrow-up-circle",
    color: "#EF4444",
  },
  {
    label: "Income",
    type: "Income",
    icon: "arrow-down-circle",
    color: "#22C55E",
  },
  { label: "Savings", type: "Savings", icon: "wallet", color: "#F59E0B" },
  {
    label: "Invest",
    type: "Investment",
    icon: "trending-up",
    color: "#3B82F6",
  },
] as const;

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const C = Colors[colorScheme];
  const { user } = useAuth();
  const router = useRouter();

  const [agg, setAgg] = useState<AggregationData | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = format(new Date(), "yyyy-MM");

  const load = useCallback(async () => {
    try {
      const [aggData, txData] = await Promise.all([
        aggregationService.getMonthly(currentMonth).catch(() => null),
        transactionService.getTransactions({ pageSize: 5 }),
      ]);
      setAgg(aggData);
      setRecentTx(txData.items);
    } catch {
      setRecentTx([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  const netBalance = (agg?.income ?? 0) - (agg?.expense ?? 0);
  const currency = user?.currency ?? "USD";

  if (loading) return <LoadingView fullScreen />;

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
        {/* Gradient Header */}
        <LinearGradient
          colors={["#7C3AED", "#4F46E5", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.userName ?? "User"} 👋</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(user?.userName ?? "U").charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>
              Net Balance · {format(new Date(), "MMMM yyyy")}
            </Text>
            <Text
              style={[
                styles.balanceAmount,
                { color: netBalance >= 0 ? "#4ADE80" : "#F87171" },
              ]}
            >
              {netBalance >= 0 ? "+" : ""}
              {netBalance.toLocaleString("en-US", {
                style: "currency",
                currency,
              })}
            </Text>
            <Text style={styles.txCount}>
              {agg?.transactionCount ?? 0} transactions this month
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Summary Grid */}
          <View style={styles.summaryGrid}>
            {(
              [
                {
                  label: "Income",
                  value: agg?.income ?? 0,
                  icon: "arrow-down-circle",
                  color: "#22C55E",
                },
                {
                  label: "Expense",
                  value: agg?.expense ?? 0,
                  icon: "arrow-up-circle",
                  color: "#EF4444",
                },
                {
                  label: "Savings",
                  value: agg?.saving ?? 0,
                  icon: "wallet",
                  color: "#F59E0B",
                },
                {
                  label: "Investment",
                  value: agg?.investment ?? 0,
                  icon: "trending-up",
                  color: "#3B82F6",
                },
              ] as const
            ).map((item) => (
              <View
                key={item.label}
                style={[styles.summaryCard, { backgroundColor: C.surface }]}
              >
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <Text style={[styles.summaryValue, { color: C.text }]}>
                  {item.value.toLocaleString("en-US", {
                    style: "currency",
                    currency,
                    maximumFractionDigits: 0,
                  })}
                </Text>
                <Text style={[styles.summaryLabel, { color: C.textSecondary }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={[styles.section, { backgroundColor: C.surface }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              Quick Add
            </Text>
            <View style={styles.quickActions}>
              {QUICK_ACTIONS.map((a) => (
                <TouchableOpacity
                  key={a.type}
                  style={styles.quickAction}
                  onPress={() =>
                    router.push({
                      pathname: "/transaction/create",
                      params: { type: a.type },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: a.color + "20" },
                    ]}
                  >
                    <Ionicons name={a.icon as any} size={22} color={a.color} />
                  </View>
                  <Text
                    style={[
                      styles.quickActionLabel,
                      { color: C.textSecondary },
                    ]}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.recentHeader}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <Text style={{ color: C.tint, fontWeight: "600", fontSize: 13 }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {recentTx.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: C.surface }]}>
              <Ionicons
                name="receipt-outline"
                size={32}
                color={C.textSecondary}
              />
              <Text style={[{ color: C.textSecondary, marginTop: 8 }]}>
                No transactions yet
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/transaction/create",
                    params: { type: "Expense" },
                  })
                }
              >
                <Text
                  style={{ color: C.tint, fontWeight: "600", marginTop: 4 }}
                >
                  Add your first one →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentTx.map((tx) => (
              <TransactionCard
                key={tx.tranactionId}
                transaction={tx}
                onPress={() =>
                  router.push({
                    pathname: "/transaction/[id]",
                    params: { id: tx.tranactionId },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: "/transaction/create",
            params: { type: "Expense" },
          })
        }
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#7C3AED", "#4F46E5"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 32 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { color: "rgba(255,255,255,0.75)", fontSize: 13 },
  userName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  balanceCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceAmount: { fontSize: 36, fontWeight: "800", letterSpacing: -0.5 },
  txCount: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 },
  body: { padding: 16 },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    width: (width - 56) / 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  summaryValue: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  summaryLabel: { fontSize: 12, fontWeight: "500" },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  quickActions: { flexDirection: "row", justifyContent: "space-between" },
  quickAction: { alignItems: "center", flex: 1 },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionLabel: { fontSize: 11, fontWeight: "600" },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyCard: { borderRadius: 16, padding: 32, alignItems: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
