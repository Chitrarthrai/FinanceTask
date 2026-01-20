import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";
import { useAuth } from "../context/AuthContext";
import { useColorScheme } from "nativewind";
import {
  User,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-slate-500 dark:text-indigo-200 font-bold uppercase text-xs mb-2 ml-4 tracking-wider">
        {title}
      </Text>
      <GlassView
        intensity={20}
        className="rounded-2xl overflow-hidden mx-4 bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10">
        {children}
      </GlassView>
    </View>
  );

  const SettingsItem = ({ icon: Icon, label, value, onPress, isLast }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className={`flex-row items-center p-4 ${
        !isLast ? "border-b border-black/5 dark:border-white/5" : ""
      }`}>
      <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 items-center justify-center mr-3">
        <Icon size={18} color={isDark ? "#cbd5e1" : "#475569"} />
      </View>
      <Text className="flex-1 text-slate-800 dark:text-white font-medium text-base tracking-wide">
        {label}
      </Text>
      {value}
      {onPress && !value && <ChevronRight size={18} color="#94a3b8" />}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="p-6 items-center">
          <View className="w-20 h-20 bg-indigo-500 rounded-full items-center justify-center mb-4 shadow-lg shadow-indigo-500/50 border-2 border-white/20 dark:border-white/20">
            <Text className="text-3xl font-bold text-white">
              {user?.email?.[0].toUpperCase()}
            </Text>
          </View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {user?.email}
          </Text>
          <Text className="text-indigo-600 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-500/30">
            Free Plan
          </Text>
        </View>

        <Section title="Preferences">
          <SettingsItem
            icon={isDark ? Moon : Sun}
            label="Dark Mode"
            value={
              <Switch
                value={isDark}
                onValueChange={toggleColorScheme}
                trackColor={{ false: "#94a3b8", true: "#6366f1" }}
                thumbColor={"#ffffff"}
              />
            }
          />
          <SettingsItem icon={Bell} label="Notifications" isLast />
        </Section>

        <Section title="Account">
          <SettingsItem
            icon={User}
            label="Profile Details"
            onPress={() => navigation.navigate("Profile" as never)}
          />
          <SettingsItem
            icon={Shield}
            label="Security"
            isLast
            onPress={() => navigation.navigate("Security" as never)}
          />
        </Section>

        <Section title="Support">
          <SettingsItem
            icon={HelpCircle}
            label="Help Center"
            isLast
            onPress={() => {}}
          />
        </Section>

        <View className="mx-4 mt-4">
          <TouchableOpacity
            onPress={signOut}
            className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-xl flex-row items-center justify-center active:bg-rose-100 dark:active:bg-rose-500/20">
            <LogOut size={20} color="#fb7185" className="mr-2" />
            <Text className="text-rose-500 dark:text-rose-300 font-bold tracking-wide">
              Sign Out
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-slate-500 text-xs mt-4">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SettingsScreen;
