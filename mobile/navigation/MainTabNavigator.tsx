import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  MessageSquare,
  CheckSquare,
  FileText,
  Share2,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import CustomTabBar from "./CustomTabBar";
import DashboardScreen from "../screens/DashboardScreen";
import { useData } from "../context/DataContext";

// Screens
import TransactionsScreen from "../screens/TransactionsScreen";
import TasksScreen from "../screens/TasksScreen";
import ChatScreen from "../screens/ChatScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ReportsScreen from "../screens/ReportsScreen"; // The "Report Paper" view
import AnalyticsScreen from "../screens/AnalyticsScreen"; // The "Deep Dive" charts view
import P2PShareScreen from "../screens/P2PShareScreen";

const Tab = createBottomTabNavigator();

const renderTabBar = (props: any) => <CustomTabBar {...props} />;

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      id="MainTab"
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
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
      <Tab.Screen
        name="P2PTab"
        component={P2PShareScreen}
        options={{
          tabBarLabel: "Share",
          tabBarIcon: ({ color, size }) => <Share2 color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
