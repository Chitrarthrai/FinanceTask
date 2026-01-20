import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";
import { useData } from "../context/DataContext";
import { Task, TaskStatus } from "../types";
import {
  Plus,
  CheckCircle,
  Clock,
  Circle,
  Calendar,
  Search,
  X,
  Tag,
  Flag,
  MoreHorizontal,
  Trash2,
  List,
} from "lucide-react-native";
import AddTaskModal from "../components/AddTaskModal";

const TasksScreen = () => {
  const { tasks, updateTaskStatus, deleteTask } = useData();
  const [activeTab, setActiveTab] = useState<TaskStatus>("todo");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === activeTab)
      .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, activeTab, searchQuery]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 text-rose-600 border-rose-200";
      case "medium":
        return "bg-amber-100 text-amber-600 border-amber-200";
      case "low":
        return "bg-blue-100 text-blue-600 border-blue-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const priorityColorText = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-rose-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-blue-600";
      default:
        return "text-slate-600";
    }
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <GlassView
      intensity={20}
      className="p-4 rounded-2xl mb-3 shadow-none border border-black/5 dark:border-white/10 mx-4 bg-white/40 dark:bg-white/5">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-2 mb-1">
            <View
              className={`px-2 py-0.5 rounded-md border ${
                getPriorityColor(item.priority).split(" ")[0]
              } ${getPriorityColor(item.priority).split(" ")[2]} opacity-80`}>
              <Text
                className={`text-[10px] font-bold uppercase ${priorityColorText(
                  item.priority,
                )}`}>
                {item.priority}
              </Text>
            </View>
            {item.category && (
              <View className="px-2 py-0.5 rounded-md bg-white/40 dark:bg-white/10">
                <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase">
                  {item.category}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-1 line-through-none">
            {item.title}
          </Text>
          {item.description ? (
            <Text
              className="text-sm text-slate-600 dark:text-slate-400 mb-2"
              numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-black/5 dark:border-white/10">
        <View className="flex-row items-center gap-1.5 bg-white/40 dark:bg-white/5 px-2 py-1 rounded-md">
          <Calendar size={12} color="#94a3b8" />
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {item.dueDate
              ? new Date(item.dueDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "No date"}
          </Text>
        </View>

        <View className="flex-row gap-2">
          {/* Status Actions */}
          {item.status !== "todo" && (
            <TouchableOpacity
              onPress={() => updateTaskStatus(item.id, "todo")}
              className="p-1.5 rounded-lg bg-white/10 border border-white/10"
              accessibilityLabel="Move to Todo">
              <Circle size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
          {item.status !== "in-progress" && (
            <TouchableOpacity
              onPress={() => updateTaskStatus(item.id, "in-progress")}
              className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30"
              accessibilityLabel="Move to In Progress">
              <Clock size={16} color="#60a5fa" />
            </TouchableOpacity>
          )}
          {item.status !== "completed" && (
            <TouchableOpacity
              onPress={() => updateTaskStatus(item.id, "completed")}
              className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30"
              accessibilityLabel="Mark Complete">
              <CheckCircle size={16} color="#34d399" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 ml-1">
            <Trash2 size={16} color="#fb7185" />
          </TouchableOpacity>
        </View>
      </View>
    </GlassView>
  );

  return (
    <ScreenWrapper>
      <View className="px-4 py-4 z-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tasks
          </Text>
          <View className="flex-row gap-2">
            <View className="bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1 rounded-full">
              <Text className="text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                {tasks.filter((t) => t.status === "todo").length} Pending
              </Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <GlassView
          intensity={20}
          className="flex-row items-center rounded-2xl px-4 py-3 border border-black/5 dark:border-white/20 bg-white/40 dark:bg-white/10">
          <Search size={20} color="#94a3b8" />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-3 font-medium text-slate-900 dark:text-white text-base"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </GlassView>
      </View>

      {/* Kanban-like Tabs */}
      <View className="flex-row px-4 py-4 gap-2">
        {(["todo", "in-progress", "completed"] as TaskStatus[]).map(
          (status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setActiveTab(status)}
              className={`flex-1 py-3 rounded-2xl border items-center ${
                activeTab === status
                  ? "bg-white border-white"
                  : "bg-white/10 border-white/5"
              }`}>
              <Text
                className={`font-bold capitalize text-xs ${
                  activeTab === status
                    ? "text-slate-900"
                    : "text-slate-500 dark:text-slate-300"
                }`}>
                {status.replace("-", " ")}
              </Text>
              <View
                className={`mt-1 px-1.5 py-0.5 rounded-full ${
                  activeTab === status
                    ? "bg-slate-100"
                    : "bg-black/5 dark:bg-white/10"
                }`}>
                <Text
                  className={`text-[10px] font-bold ${
                    activeTab === status
                      ? "text-slate-900"
                      : "text-slate-500 dark:text-white"
                  }`}>
                  {tasks.filter((t) => t.status === status).length}
                </Text>
              </View>
            </TouchableOpacity>
          ),
        )}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <List size={64} color="rgba(255,255,255,0.2)" />
            <Text className="text-slate-400 mt-4 font-medium text-lg">
              No tasks in {activeTab.replace("-", " ")}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-24 right-6 w-14 h-14 bg-indigo-500 rounded-full items-center justify-center shadow-lg shadow-indigo-500/40 border border-white/20"
        onPress={() => setIsModalOpen(true)}>
        <Plus color="white" size={30} />
      </TouchableOpacity>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}} // Context updates automatically
      />
    </ScreenWrapper>
  );
};

export default TasksScreen;
