import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";
import { supabase } from "../lib/supabase";
import {
  ChevronLeft,
  Lock,
  Key,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const SecurityScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      Alert.alert("Success", "Password updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            setPassword("");
            setConfirmPassword("");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Notice", "Account deletion is disabled in this demo.");
          },
        },
      ],
    );
  };

  return (
    <ScreenWrapper>
      <View className="flex-row items-center p-6 mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 bg-white/10 dark:bg-black/20 rounded-full mr-4 border border-black/5 dark:border-white/10">
          <ChevronLeft size={24} className="text-slate-800 dark:text-white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">
          Security
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full items-center justify-center bg-emerald-100 dark:bg-emerald-500/20 mb-4 border border-emerald-200 dark:border-emerald-500/30">
            <ShieldCheck
              size={40}
              className="text-emerald-500 dark:text-emerald-400"
            />
          </View>
          <Text className="text-slate-600 dark:text-slate-300 text-center font-medium">
            Manage your account security and password settings.
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-slate-500 dark:text-indigo-200 font-bold uppercase text-xs mb-2 ml-1 tracking-wider">
              New Password
            </Text>
            <GlassView
              intensity={20}
              className="flex-row items-center p-1 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <View className="p-3">
                <Lock size={20} className="text-slate-400" />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="flex-1 text-slate-800 dark:text-white font-medium text-base py-3"
              />
            </GlassView>
          </View>

          <View>
            <Text className="text-slate-500 dark:text-indigo-200 font-bold uppercase text-xs mb-2 ml-1 tracking-wider">
              Confirm Password
            </Text>
            <GlassView
              intensity={20}
              className="flex-row items-center p-1 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <View className="p-3">
                <Key size={20} className="text-slate-400" />
              </View>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="flex-1 text-slate-800 dark:text-white font-medium text-base py-3"
              />
            </GlassView>
          </View>

          <TouchableOpacity
            onPress={handleUpdatePassword}
            disabled={loading}
            className="flex-row items-center justify-center bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/30 mt-4 h-14">
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-lg">
                  Update Password
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="mt-8 bg-rose-50 dark:bg-rose-500/10 p-5 rounded-2xl border border-rose-200 dark:border-rose-500/20">
          <View className="flex-row items-center mb-2">
            <AlertTriangle
              size={20}
              className="text-rose-500 dark:text-rose-400 mr-2"
            />
            <Text className="text-rose-600 dark:text-rose-400 font-bold text-lg">
              Danger Zone
            </Text>
          </View>
          <Text className="text-slate-600 dark:text-rose-200/70 text-sm mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </Text>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-white dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-3 rounded-xl items-center">
            <Text className="text-rose-500 dark:text-rose-300 font-bold">
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SecurityScreen;
