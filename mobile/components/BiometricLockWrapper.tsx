import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  AppState,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticateWithBiometrics } from "../services/biometrics";
import { GlassView } from "./ui/GlassView";
import { Lock, Fingerprint, RefreshCw } from "lucide-react-native";

interface BiometricLockWrapperProps {
  children: React.ReactNode;
}

export const BiometricLockWrapper = ({ children }: BiometricLockWrapperProps) => {
  const { session } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const appState = useRef(AppState.currentState);

  const checkLock = async () => {
    if (!session?.user || process.env.EXPO_PUBLIC_TEST_MODE === "true" || process.env.NODE_ENV === "test") {
      setIsLocked(false);
      return;
    }

    const enabled = await AsyncStorage.getItem("biometrics_enabled");
    if (enabled === "true") {
      setIsLocked(true);
      triggerAuth();
    } else {
      setIsLocked(false);
    }
  };

  const triggerAuth = async () => {
    setLoading(true);
    try {
      const auth = await authenticateWithBiometrics("Verify your identity to unlock FinanceTask");
      if (auth.success) {
        setIsLocked(false);
      }
    } catch (error) {
      console.warn("Biometric verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Run on initial mount and when user session changes
  useEffect(() => {
    checkLock();
  }, [session]);

  // Run on app state transitions (background to foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkLock();
      }
      appState.current = nextAppState as any;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [session]);

  if (isLocked) {
    return (
      <View testID="biometric-lock-screen" style={StyleSheet.absoluteFillObject} className="bg-slate-950 flex-1 justify-center items-center px-8 z-[99999]">
        {/* Background Decorative Blur Orbs */}
        <View className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <View className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-cyan-500/25 blur-3xl" />

        <GlassView intensity={40} className="w-full p-8 rounded-3xl items-center border border-white/10 bg-white/5">
          <View className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 items-center justify-center mb-6">
            <Lock size={36} color="#818cf8" />
          </View>

          <Text className="text-2xl font-extrabold text-white text-center mb-2 tracking-tight">
            Workspace Locked
          </Text>
          <Text className="text-slate-400 text-sm text-center mb-8 font-medium">
            Please authenticate using biometrics or your device passcode to access FinanceTask.
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#00f2ff" />
          ) : (
            <View className="w-full gap-4">
              <TouchableOpacity
                testID="btn-unlock-biometric"
                onPress={triggerAuth}
                className="py-4 bg-indigo-600 rounded-2xl items-center justify-center flex-row gap-2 border border-indigo-500">
                <Fingerprint size={20} color="white" />
                <Text className="text-white font-extrabold text-base">
                  Unlock Workspace
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={triggerAuth}
                className="py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl items-center justify-center flex-row gap-2">
                <RefreshCw size={14} color="#94a3b8" />
                <Text className="text-slate-400 font-bold text-sm">
                  Retry Authentication
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassView>
      </View>
    );
  }

  return <>{children}</>;
};
