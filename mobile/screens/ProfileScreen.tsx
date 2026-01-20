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
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { ChevronLeft, User, Mail, Save } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || "",
  );

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
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
          Profile Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <GlassView
            intensity={40}
            className="w-28 h-28 rounded-full items-center justify-center bg-indigo-500/20 dark:bg-white/5 border border-indigo-200 dark:border-white/10 mb-4">
            <Text className="text-4xl font-bold text-indigo-600 dark:text-white">
              {user?.email?.[0].toUpperCase()}
            </Text>
          </GlassView>
          <Text className="text-slate-500 dark:text-slate-400 font-medium">
            Member since {new Date(user?.created_at || "").getFullYear()}
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-6">
          <View>
            <Text className="text-slate-500 dark:text-indigo-200 font-bold uppercase text-xs mb-2 ml-1 tracking-wider">
              Email Address
            </Text>
            <GlassView
              intensity={20}
              className="flex-row items-center p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <Mail size={20} className="text-slate-400 mr-3" />
              <Text className="text-slate-600 dark:text-slate-300 font-medium">
                {user?.email}
              </Text>
            </GlassView>
          </View>

          <View>
            <Text className="text-slate-500 dark:text-indigo-200 font-bold uppercase text-xs mb-2 ml-1 tracking-wider">
              Full Name
            </Text>
            <GlassView
              intensity={20}
              className="flex-row items-center p-1 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <View className="p-3">
                <User size={20} className="text-slate-400" />
              </View>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
                className="flex-1 text-slate-800 dark:text-white font-medium text-base py-3"
              />
            </GlassView>
          </View>

          <TouchableOpacity
            onPress={handleUpdateProfile}
            disabled={loading}
            className="flex-row items-center justify-center bg-indigo-500 p-4 rounded-2xl shadow-lg shadow-indigo-500/30 mt-4 h-14">
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={20} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ProfileScreen;
