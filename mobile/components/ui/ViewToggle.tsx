import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CheckCircle, FileText } from "lucide-react-native";

interface ViewToggleProps {
  activeView: "tasks" | "notes";
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ activeView }) => {
  const navigation = useNavigation<any>();

  return (
    <View className="px-4 py-2">
      <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-black/5 dark:border-white/5">
        <TouchableOpacity
          onPress={() => navigation.navigate("TasksList")}
          className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${
            activeView === "tasks" ? "bg-white dark:bg-slate-700 shadow-sm" : ""
          }`}>
          <CheckCircle
            size={18}
            color={activeView === "tasks" ? "#4f46e5" : "#94a3b8"}
          />
          <Text
            className={`font-bold ${
              activeView === "tasks"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}>
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("NotesList")}
          className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${
            activeView === "notes" ? "bg-white dark:bg-slate-700 shadow-sm" : ""
          }`}>
          <FileText
            size={18}
            color={activeView === "notes" ? "#8b5cf6" : "#94a3b8"}
          />
          <Text
            className={`font-bold ${
              activeView === "notes"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}>
            Notes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
