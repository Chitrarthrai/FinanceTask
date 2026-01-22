import React from "react";
import { View, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { useColorScheme } from "nativewind";
import { useData } from "../../context/DataContext";

interface ScreenWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  className = "",
}) => {
  const { colorScheme } = useColorScheme();
  const { navPosition, isNavHidden, isNavCollapsed } = useData();
  const isDark = colorScheme === "dark";

  // Calculate dynamic padding based on nav position
  const getNavPadding = () => {
    // Side Navigation (Left/Right) is ALWAYS overlay/floating now
    // We do NOT add padding for it, letting content go full width.
    if (navPosition === "left" || navPosition === "right") {
      return "";
    }

    // Collapsed Mode: Smaller padding for Top/Bottom FAB
    if (isNavCollapsed) {
      switch (navPosition) {
        case "bottom":
          return "pb-4";
        case "top":
          return "pt-4";
      }
    }

    // Normal Mode (Top/Bottom)
    switch (navPosition) {
      case "bottom":
        return "pb-4"; // Reduced from 32 to tighten gap
      case "top":
        return "pt-4"; // Reduced from 32 to tighten gap
      default:
        return "pb-24";
    }
  };

  const navPaddingClass = getNavPadding();

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

      <SafeAreaView className={`flex-1 ${navPaddingClass} ${className}`}>
        {children}
      </SafeAreaView>
    </View>
  );
};
