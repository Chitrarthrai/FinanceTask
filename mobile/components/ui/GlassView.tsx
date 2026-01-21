import React from "react";
import { View, ViewProps, Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { cssInterop, useColorScheme } from "nativewind";

// Enable generic styling for BlurView if needed, though usually we wrap it.
cssInterop(BlurView, {
  className: "style",
});

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?:
    | "light"
    | "dark"
    | "default"
    | "prominent"
    | "systemThinMaterial"
    | "systemMaterial"
    | "systemThickMaterial"
    | "systemChromeMaterial"
    | "systemUltraThinMaterial"
    | "systemMaterialLight"
    | "systemMaterialDark";
  className?: string; // NativeWind className
  children?: React.ReactNode;
}

export const GlassView: React.FC<GlassViewProps> = ({
  intensity = 50,
  tint = "dark",
  className = "",
  style,
  children,
  ...props
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // If no explicit tint is provided (or it's the default "dark" from props), adapt to theme
  // We want "light" tint in light mode and "dark" tint in dark mode for standard glass
  const adaptiveTint = tint === "dark" && !isDark ? "light" : tint;

  // Use safe classes only - no opacity in class names
  const containerClasses = `overflow-hidden rounded-2xl ${className}`;

  // Inline styles for opacity-based colors to avoid NativeWind CSS race condition
  const themeStyles = isDark
    ? {
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
      }
    : {
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.05)",
      };

  if (Platform.OS === "android") {
    return (
      <View
        className={containerClasses}
        style={[themeStyles, style]}
        {...props}>
        <BlurView
          intensity={intensity}
          tint={adaptiveTint}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={adaptiveTint}
      className={containerClasses}
      style={[themeStyles, style]}
      {...props}>
      {children}
    </BlurView>
  );
};
