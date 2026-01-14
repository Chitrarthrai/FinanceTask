import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { styled } from "nativewind";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) Alert.alert("Error", error.message);
  };

  return (
    <View className="flex-1 justify-center px-8 bg-slate-900">
      <View className="mb-10">
        <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
        <Text className="text-slate-400">Sign in to FinanceTask</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-slate-300 mb-2 font-medium">Email</Text>
          <TextInput
            className="w-full bg-slate-800 text-white p-4 rounded-xl border border-slate-700"
            placeholder="entry.stack@gmail.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-slate-300 mb-2 font-medium">Password</Text>
          <TextInput
            className="w-full bg-slate-800 text-white p-4 rounded-xl border border-slate-700"
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          className="w-full bg-indigo-600 p-4 rounded-xl items-center mt-6">
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
