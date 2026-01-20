import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { X, Check, Calendar, Flag, Tag, Repeat } from "lucide-react-native";
import { GlassView } from "./ui/GlassView";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTaskModal = ({ isOpen, onClose, onSuccess }: AddTaskModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurring, setRecurring] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(new Date());
    setRecurring(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        title,
        description,
        status: "todo",
        priority,
        due_date: dueDate.toISOString(),
        recurring,
        category: "Personal", // Default
      });

      if (error) throw error;

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View className="flex-1 justify-end bg-black/80 dark:bg-black/80">
        <GlassView
          intensity={40}
          className="bg-white/95 dark:bg-slate-900/90 rounded-t-3xl h-[85%] border-t border-black/5 dark:border-white/20">
          <View className="flex-row justify-between items-center p-5 border-b border-black/5 dark:border-white/10">
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-slate-100 dark:bg-white/10 rounded-full">
              <X size={20} color={user ? "#64748b" : "white"} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
              New Task
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="p-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40">
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Check size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Title
              </Text>
              <TextInput
                className="bg-white dark:bg-white/5 p-4 rounded-xl text-slate-900 dark:text-white font-medium border border-slate-100 dark:border-white/10 text-lg"
                placeholder="e.g., Review Budget"
                placeholderTextColor="rgba(148,163,184,0.5)"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Description
              </Text>
              <TextInput
                className="bg-white dark:bg-white/5 p-4 rounded-xl text-slate-900 dark:text-white font-medium border border-slate-100 dark:border-white/10 min-h-[100px]"
                placeholder="Add details..."
                placeholderTextColor="rgba(148,163,184,0.5)"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                Priority
              </Text>
              <View className="flex-row gap-3">
                {["low", "medium", "high"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p as any)}
                    className={`px-4 py-2 rounded-lg border ${
                      priority === p
                        ? p === "high"
                          ? "bg-rose-500 border-rose-500"
                          : p === "medium"
                            ? "bg-amber-500 border-amber-500"
                            : "bg-blue-500 border-blue-500"
                        : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10"
                    }`}>
                    <Text
                      className={`font-bold capitalize ${
                        priority === p
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Due Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10">
                <Calendar size={20} color="#94a3b8" className="mr-3" />
                <Text className="text-slate-900 dark:text-white font-medium">
                  {dueDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="default"
                  themeVariant="dark"
                  onChange={(event: any, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDueDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View className="flex-row items-center justify-between bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10 mb-6">
              <View className="flex-row items-center gap-3">
                <Repeat size={20} color="#94a3b8" />
                <Text className="text-slate-900 dark:text-white font-bold">
                  Repeat Daily
                </Text>
              </View>
              <Switch
                value={recurring}
                onValueChange={setRecurring}
                trackColor={{ false: "#94a3b8", true: "#6366f1" }}
                thumbColor={"#ffffff"}
              />
            </View>
          </ScrollView>
        </GlassView>
      </View>
    </Modal>
  );
};

export default AddTaskModal;
