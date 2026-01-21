import React from "react";
import { View, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { useColorScheme } from "nativewind";

interface ScreenWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  className = "",
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {/* Vibrant Gradient Background */}
      <LinearGradient
        // Deep purple/slate for dark mode, Soft blue/white for light mode
        colors={
          isDark
            ? ["#0f172a", "#1e1b4b", "#312e81"]
            : ["#f8fafc", "#e0f2fe", "#e0e7ff"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Optional: Add some decorative gradient orbs for extra "glass" depth */}
      <LinearGradient
        colors={["#f472b6", "transparent"]}
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          opacity: isDark ? 0.2 : 0.4,
        }}
      />
      <LinearGradient
        colors={
          isDark ? ["#6366f1", "transparent"] : ["#3b82f6", "transparent"]
        }
        style={{
          position: "absolute",
          bottom: -50,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: 150,
          opacity: isDark ? 0.2 : 0.4,
        }}
      />

      <SafeAreaView className={`flex-1 ${className}`}>{children}</SafeAreaView>
    </View>
  );
};
