import React from "react";
import { View, ViewProps, Platform } from "react-native";
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

  // Adapt border and background fallback for themes:
  // Dark: border-white/20
  // Light: border-black/10 (or slate-200)
  const containerClasses = `overflow-hidden rounded-2xl border ${
    isDark ? "border-white/20" : "border-black/5"
  } ${className}`;

  if (Platform.OS === "android") {
    // Android BlurView support can be tricky or less performant,
    // sometimes a simple translucent background is safer or cleaner if blur is buggy.
    // However, expo-blur works on Android.
    // We add a fallback background color for better readability on top of the blur
    return (
      <View
        className={`${containerClasses} ${isDark ? "bg-black/40" : "bg-white/40"}`}
        style={style}
        {...props}>
        {/* Note: Android might need an absolute BlurView inside to work perfectly, 
                 or we just stick to high-quality translucent visuals. 
                 Let's try nesting BlurView for maximum effect. */}
        <BlurView
          intensity={intensity}
          tint={adaptiveTint}
          style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
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
      style={style}
      {...props}>
      {/* iOS BlurView acts as a container naturally */}
      {children}
    </BlurView>
  );
};
