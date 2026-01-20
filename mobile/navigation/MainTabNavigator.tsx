import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  MessageSquare,
  CheckSquare,
  FileText,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { GlassView } from "../components/ui/GlassView";
import DashboardScreen from "../screens/DashboardScreen";

// Screens
import TransactionsScreen from "../screens/TransactionsScreen";
import TasksScreen from "../screens/TasksScreen";
import ChatScreen from "../screens/ChatScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ReportsScreen from "../screens/ReportsScreen"; // The "Report Paper" view
import AnalyticsScreen from "../screens/AnalyticsScreen"; // The "Deep Dive" charts view

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tab.Navigator
      id="MainTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 70,
          borderRadius: 35,
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          <GlassView
            intensity={80}
            className="absolute inset-0 rounded-[35px] overflow-hidden border border-black/5 dark:border-white/20 bg-white/80 dark:bg-black/30"
            style={{ borderRadius: 35 }}
          />
        ),
        tabBarActiveTintColor: isDark ? "#fbbf24" : "#4f46e5", // Amber for dark, Indigo for light
        tabBarInactiveTintColor: isDark
          ? "rgba(255,255,255,0.6)"
          : "rgba(71,85,105,0.6)",
        tabBarShowLabel: false, // Cleaner glass look often hides labels or keeps them minimal
        tabBarItemStyle: {
          paddingVertical: 10,
        },
      }}>
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsScreen}
        options={{
          tabBarLabel: "Transactions",
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksScreen}
        options={{
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <CheckSquare color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <PieChart color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarLabel: "Reports",
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          tabBarLabel: "AI Chat",
          tabBarIcon: ({ color, size }) => (
            <MessageSquare color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
