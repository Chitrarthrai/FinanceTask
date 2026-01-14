import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut,
  LayoutDashboard,
  Wallet,
  CheckSquare,
} from "lucide-react-native";

const DashboardScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView className="px-6 py-6">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              Hello, {user?.user_metadata?.full_name?.split(" ")[0] || "User"}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400">
              Here is your financial overview
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => signOut()}
            className="p-2 bg-white dark:bg-slate-800 rounded-full">
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-8">
          <View className="flex-1 min-w-37.5 p-4 bg-indigo-500 rounded-2xl">
            <LayoutDashboard size={24} color="white" className="mb-2" />
            <Text className="text-white/80 text-xs font-medium">
              Daily Limit
            </Text>
            <Text className="text-white text-xl font-bold">$120.50</Text>
          </View>
          <View className="flex-1 min-w-37.5 p-4 bg-emerald-500 rounded-2xl">
            <Wallet size={24} color="white" className="mb-2" />
            <Text className="text-white/80 text-xs font-medium">Savings</Text>
            <Text className="text-white text-xl font-bold">$4,250</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            Upcoming Tasks
          </Text>
          <View className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex-row items-center gap-3">
            <View className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <CheckSquare size={20} color="#6366f1" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800 dark:text-white">
                Review Monthly Budget
              </Text>
              <Text className="text-xs text-slate-500">Today, 5:00 PM</Text>
            </View>
            <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
              <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                High
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
