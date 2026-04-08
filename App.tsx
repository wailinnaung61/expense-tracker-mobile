import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "./stores";
import { LoadingSpinner } from "./components/ui";
import "./i18n";

// Auth Screens
import SignInScreen from "./screens/auth/SignInScreen";
import MfaScreen from "./screens/auth/MfaScreen";

// Main Screens
import DashboardScreen from "./screens/dashboard/DashboardScreen";
import TransactionsScreen from "./screens/transactions/TransactionsScreen";
import BudgetScreen from "./screens/budget/BudgetScreen";
import ChatScreen from "./screens/chat/ChatScreen";
import ProfileScreen from "./screens/profile/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  const { requiresMfa } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {requiresMfa ? (
        <Stack.Screen name="Mfa" component={MfaScreen} />
      ) : (
        <Stack.Screen name="SignIn" component={SignInScreen} />
      )}
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: "Transactions" }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ title: "Budget" }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "AI Chat" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { user, loadUser, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadUser();
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady || isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
