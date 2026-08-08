import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Svg, { Path } from "react-native-svg";
import { supabase } from "../lib/supabase";

import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split("@")[0],
          },
        },
      });
      setLoading(false);
      if (error) {
        Alert.alert("Sign Up Error", error.message);
      } else {
        Alert.alert(
          "Account Created",
          "Check your email for confirmation link or sign in!"
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) Alert.alert("Sign In Error", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const redirectUrl = Linking.createURL("google-auth");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === "success" && result.url) {
          const parsed = Linking.parse(result.url);
          let accessToken = parsed.queryParams?.access_token;
          let refreshToken = parsed.queryParams?.refresh_token;

          if (!accessToken && result.url.includes("access_token=")) {
            const hashString = result.url.substring(result.url.indexOf("access_token="));
            const params = new URLSearchParams(hashString);
            accessToken = params.get("access_token") || undefined;
            refreshToken = params.get("refresh_token") || undefined;
          }

          if (accessToken) {
            await supabase.auth.setSession({
              access_token: String(accessToken),
              refresh_token: String(refreshToken || ""),
            });
          }
        }
      }
    } catch (err: any) {
      Alert.alert("Google Sign-In Error", err.message || "Could not sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="justify-center px-6">
      <GlassView
        intensity={50}
        className="p-8 rounded-3xl border border-black/5 dark:border-white/20 bg-white/40 dark:bg-black/20">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <Text className="text-slate-600 dark:text-slate-300 text-center text-base">
            {isSignUp
              ? "Register to access FinanceTask"
              : "Sign in to FinanceTask"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex-row items-center justify-center space-x-3 bg-white/80 dark:bg-white/10 p-4 rounded-xl border border-slate-200 dark:border-white/20 mb-6">
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </Svg>
          <Text className="text-slate-900 dark:text-white font-semibold text-base ml-2">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-[1px] bg-slate-300 dark:bg-white/20" />
          <Text className="mx-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
            or email
          </Text>
          <View className="flex-1 h-[1px] bg-slate-300 dark:bg-white/20" />
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-slate-700 dark:text-white/80 mb-1 font-medium ml-1">
              Email
            </Text>
            <GlassView
              intensity={30}
              className="rounded-xl overflow-hidden border border-black/5 dark:border-white/30 bg-white/50 dark:bg-white/5">
              <TextInput
                testID="input-login-email"
                className="w-full text-slate-900 dark:text-white p-4 text-lg"
                placeholder="you@domain.com"
                placeholderTextColor="rgba(148,163,184,0.6)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </GlassView>
          </View>

          <View>
            <Text className="text-slate-700 dark:text-white/80 mb-1 font-medium ml-1">
              Password
            </Text>
            <GlassView
              intensity={30}
              className="rounded-xl overflow-hidden border border-black/5 dark:border-white/30 bg-white/50 dark:bg-white/5">
              <TextInput
                testID="input-login-password"
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
            testID="btn-login-submit"
            onPress={handleAuth}
            disabled={loading}
            className="w-full bg-indigo-600 p-4 rounded-xl items-center mt-4 border border-indigo-500">
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-xl tracking-wide">
                {isSignUp ? "Create Account" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            className="mt-4 p-2 items-center">
            <Text className="text-indigo-600 dark:text-indigo-400 font-medium text-base">
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassView>
    </ScreenWrapper>
  );
};

export default LoginScreen;
