import "./global.css";
import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import MainTabNavigator from "./navigation/MainTabNavigator";
import SettingsScreen from "./screens/SettingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SecurityScreen from "./screens/SecurityScreen";
import { ActivityIndicator, View } from "react-native";

import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";

enableScreens();

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} id="RootStack">
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

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
