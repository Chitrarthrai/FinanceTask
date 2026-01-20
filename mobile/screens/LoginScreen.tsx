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

import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";

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
    <ScreenWrapper className="justify-center px-6">
      <GlassView
        intensity={50}
        className="p-8 rounded-3xl border border-black/5 dark:border-white/20 bg-white/40 dark:bg-black/20">
        <View className="mb-8">
          <Text className="text-4xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            Welcome Back
          </Text>
          <Text className="text-slate-600 dark:text-slate-300 text-center text-lg">
            Sign in to FinanceTask
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-slate-700 dark:text-white/80 mb-2 font-medium ml-1">
              Email
            </Text>
            <GlassView
              intensity={30}
              className="rounded-xl overflow-hidden border border-black/5 dark:border-white/30 bg-white/50 dark:bg-white/5">
              <TextInput
                className="w-full text-slate-900 dark:text-white p-4 text-lg"
                placeholder="entry.stack@gmail.com"
                placeholderTextColor="rgba(148,163,184,0.6)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </GlassView>
          </View>

          <View>
            <Text className="text-slate-700 dark:text-white/80 mb-2 font-medium ml-1">
              Password
            </Text>
            <GlassView
              intensity={30}
              className="rounded-xl overflow-hidden border border-black/5 dark:border-white/30 bg-white/50 dark:bg-white/5">
              <TextInput
                className="w-full text-slate-900 dark:text-white p-4 text-lg"
                placeholder="••••••••"
                placeholderTextColor="rgba(148,163,184,0.6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </GlassView>
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="w-full bg-indigo-500 p-4 rounded-xl items-center mt-6 shadow-lg shadow-indigo-500/30 border border-indigo-400/50">
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-xl tracking-wide">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </GlassView>
    </ScreenWrapper>
  );
};

export default LoginScreen;
