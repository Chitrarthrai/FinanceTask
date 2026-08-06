import "./global.css";
import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import MainTabNavigator from "./navigation/MainTabNavigator";
import SettingsScreen from "./screens/SettingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SecurityScreen from "./screens/SecurityScreen";
import { ActivityIndicator, View, Platform } from "react-native";
import { BiometricLockWrapper } from "./components/BiometricLockWrapper";
import * as ImagePicker from "expo-image-picker";
import { requestNotificationPermissions, registerForPushNotificationsAsync } from "./services/notifications";
import { supabase } from "./lib/supabase";

import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";

enableScreens();

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef<any>();

const AppNavigator = () => {
  const { session, loading } = useAuth();

  React.useEffect(() => {
    if (session && session.user) {
      const askPermissions = async () => {
        try {
          await requestNotificationPermissions();
          await ImagePicker.requestCameraPermissionsAsync();
          await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (Platform.OS === "android") {
            try {
              const { PermissionsAndroid } = require("react-native");
              await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
                {
                  title: "SMS Receiver Permission",
                  message: "FinanceTask needs access to receive SMS transaction alerts to automate expense tracking.",
                  buttonNeutral: "Ask Me Later",
                  buttonNegative: "Cancel",
                  buttonPositive: "OK"
                }
              );
            } catch (err) {
              console.warn("Failed to request SMS permission:", err);
            }
          }

          const token = await registerForPushNotificationsAsync();
          if (token) {
            const { error } = await supabase.from("push_tokens").upsert(
              {
                user_id: session.user.id,
                token: token,
                platform: Platform.OS,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "token" }
            );
            if (error) {
              console.warn("Failed to sync push token with Supabase:", error.message);
            }
          }
        } catch (e) {
          console.warn("Failed to request upfront permissions:", e);
        }
      };
      askPermissions();
    }
  }, [session]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: true, animation: "slide_from_right" }} id="RootStack">
      {session && session.user ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ presentation: "card" }}
          />
          <Stack.Screen
            name="Security"
            component={SecurityScreen}
            options={{ presentation: "card" }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

import { Linking } from "react-native";
import { useData } from "./context/DataContext";
import AddTransactionModal from "./components/AddTransactionModal";
import AddTaskModal from "./components/AddTaskModal";

const GlobalDeepLinkHandler = () => {
  const {
    setIsGlobalAddTransactionOpen,
    setIsGlobalAddTaskOpen,
  } = useData();

  React.useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log("Incoming Deep Link:", event.url);
      const url = event.url;
      if (url.includes("add-transaction")) {
        setIsGlobalAddTransactionOpen(true);
      } else if (url.includes("add-task")) {
        setIsGlobalAddTaskOpen(true);
      } else if (url.includes("tasks")) {
        if (navigationRef.isReady()) {
          navigationRef.navigate("Main", { screen: "TasksTab" });
        }
      } else if (url.includes("reports")) {
        if (navigationRef.isReady()) {
          navigationRef.navigate("Main", { screen: "ReportsTab" });
        }
      } else if (url.includes("ai-chat")) {
        if (navigationRef.isReady()) {
          navigationRef.navigate("Main", { screen: "ChatTab" });
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, [setIsGlobalAddTransactionOpen, setIsGlobalAddTaskOpen]);

  return null;
};

const GlobalModalManager = () => {
  const {
    isGlobalAddTransactionOpen,
    setIsGlobalAddTransactionOpen,
    isGlobalAddTaskOpen,
    setIsGlobalAddTaskOpen,
    refreshData,
  } = useData();

  return (
    <>
      <AddTransactionModal
        isOpen={isGlobalAddTransactionOpen}
        onClose={() => setIsGlobalAddTransactionOpen(false)}
        onSuccess={refreshData}
      />
      <AddTaskModal
        isOpen={isGlobalAddTaskOpen}
        onClose={() => setIsGlobalAddTaskOpen(false)}
        onSuccess={refreshData}
      />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <BiometricLockWrapper>
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
              <GlobalDeepLinkHandler />
              <GlobalModalManager />
            </NavigationContainer>
          </BiometricLockWrapper>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
