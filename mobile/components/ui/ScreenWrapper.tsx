import React from "react";
import { View, StatusBar, Platform, TextInput, TouchableOpacity, Text, BackHandler } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { X } from "lucide-react-native";
import { GlassView } from "./GlassView";

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
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const {
    navPosition,
    isNavHidden,
    isNavCollapsed,
    isSearching,
    setIsSearching,
    searchText,
    setSearchText,
    searchScope,
    setSearchScope,
  } = useData();
  const isDark = colorScheme === "dark";

  React.useEffect(() => {
    if (isSearching) {
      const onBackPress = () => {
        setIsSearching(false);
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }
  }, [isSearching, setIsSearching]);

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

      {isSearching && (
        <View
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? insets.top + 10 : 35,
            left: 20,
            right: 20,
            height: 52,
            zIndex: 999,
          }}>
          <GlassView
            intensity={95}
            className="flex-1 flex-row px-4 items-center gap-2 border border-white/30 dark:border-white/10 bg-white/70 dark:bg-black/60 shadow-xl shadow-black/20 rounded-full">
            <TouchableOpacity
              onPress={() =>
                setSearchScope(
                  searchScope === "transactions" ? "tasks" : "transactions"
                )
              }
              className="flex-row items-center gap-1 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
              <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                {searchScope === "transactions" ? "Trans" : "Tasks"}
              </Text>
            </TouchableOpacity>

            <TextInput
              autoFocus
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => {
                if (searchText.trim()) {
                  const targetScreen = searchScope === "transactions" ? "TransactionsTab" : "TasksTab";
                  navigation.navigate(targetScreen, { search: searchText });
                  setIsSearching(false);
                  setSearchText("");
                }
              }}
              placeholder={`Search ${searchScope}...`}
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              className="flex-1 text-sm font-medium text-slate-900 dark:text-white h-full p-0"
              returnKeyType="search"
            />

            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchText("");
              }}
              className="p-1">
              <X size={16} color={isDark ? "#ccc" : "#555"} />
            </TouchableOpacity>
          </GlassView>
        </View>
      )}

      <SafeAreaView className={`flex-1 ${navPaddingClass} ${isSearching ? "pt-16" : ""} ${className}`}>
        {children}
      </SafeAreaView>
    </View>
  );
};
