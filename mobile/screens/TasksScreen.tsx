import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  Trash2,
  List,
  AlertTriangle,
} from "lucide-react-native";
import AddTaskModal from "../components/AddTaskModal";
import { ViewToggle } from "../components/ui/ViewToggle";

const screenWidth = Dimensions.get("window").width;

const TasksScreen = (props: any) => {
  const { tasks, updateTaskStatus, deleteTask, undoItem, undoLastDelete, refreshData } = useData();
  const [activeTab, setActiveTab] = useState<TaskStatus>("todo");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: "todo", label: "To Do", color: "text-indigo-500" },
    { status: "in-progress", label: "In Progress", color: "text-blue-500" },
    { status: "completed", label: "Completed", color: "text-emerald-500" },
    { status: "not-done", label: "Not Done", color: "text-rose-500" },
  ];

  const handleLongPressTask = (task: Task) => {
    Alert.alert(
      `Move Task: ${task.title}`,
      "Choose a status column to move this task to:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "To Do", onPress: () => updateTaskStatus(task.id, "todo") },
        { text: "In Progress", onPress: () => updateTaskStatus(task.id, "in-progress") },
        { text: "Completed", onPress: () => updateTaskStatus(task.id, "completed") },
        { text: "Not Done", onPress: () => {
          Alert.alert(
            "Mark as Not Done",
            "Are you sure you want to mark this task as abandoned?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Yes", onPress: () => updateTaskStatus(task.id, "not-done", "Rescheduled via Mobile") }
            ]
          );
        } }
      ].filter((opt: any) => opt.text === "Cancel" || opt.text.toLowerCase().replace(" ", "-") !== task.status) as any
    );
  };

  React.useEffect(() => {
    if ((props.route.params as any)?.search) {
      setSearchQuery((props.route.params as any).search);
    }
  }, [props.route.params]);

  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(
    null,
  );

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentMode = showDatePicker;
    setShowDatePicker(null);

    if (event.type === "dismissed") return;

    if (selectedDate && currentMode) {
      if (currentMode === "start") {
        setStartDate(selectedDate);
        if (endDate && endDate < selectedDate) {
          setEndDate(null);
        }
      } else {
        setEndDate(selectedDate);
        if (startDate && startDate > selectedDate) {
          setStartDate(null);
        }
      }
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === activeTab)
      .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((t) => {
        if (!startDate && !endDate) return true;
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (due < start) return false;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (due > end) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [tasks, activeTab, searchQuery, startDate, endDate]);

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
    <TouchableOpacity
      activeOpacity={0.9}
      delayLongPress={150}
      onLongPress={() => handleLongPressTask(item)}>
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
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {item.title}
          </Text>
          {item.description ? (
            <Text
              className="text-sm text-slate-600 dark:text-slate-400 mb-2"
              numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          {item.status === 'not-done' && item.reasonNotDone ? (
            <Text className="text-xs text-rose-500 font-bold mb-2">
              Reason: {item.reasonNotDone}
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
          {item.status !== "todo" && (
            <TouchableOpacity
              onPress={() => updateTaskStatus(item.id, "todo")}
              className="p-1.5 rounded-lg bg-white/10 border border-white/10">
              <Circle size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
          {item.status !== "in-progress" && (
            <TouchableOpacity
              onPress={() => updateTaskStatus(item.id, "in-progress")}
              className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Clock size={16} color="#60a5fa" />
            </TouchableOpacity>
          )}
          {item.status !== "completed" && (
            <TouchableOpacity
              onPress={() => updateTaskStatus(item.id, "completed")}
              className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle size={16} color="#34d399" />
            </TouchableOpacity>
          )}
          {item.status !== "not-done" && (
            <TouchableOpacity
              onPress={() => updateTaskStatus(item.id, "not-done", "Rescheduled via Mobile")}
              className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30">
              <AlertTriangle size={16} color="#fb7185" />
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
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <ViewToggle activeView="tasks" />

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

      <View className="px-4 pb-4 -mt-2">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
            Filter by Date
          </Text>
          {(startDate || endDate) && (
            <TouchableOpacity
              onPress={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              className="bg-rose-500/10 dark:bg-rose-500/20 px-2 py-1 rounded-md">
              <Text className="text-rose-500 dark:text-rose-400 text-[10px] font-bold">
                Clear Filter
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setShowDatePicker("start")}
            className="flex-1">
            <GlassView
              intensity={20}
              className={`flex-row items-center justify-between px-3 py-2.5 rounded-xl border ${
                startDate
                  ? "bg-indigo-500/20 border-indigo-500/50"
                  : "bg-white/40 dark:bg-white/5 border-black/5 dark:border-white/10"
              }`}>
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase">
                  From
                </Text>
                <Text
                  className={`text-xs font-bold ${
                    startDate
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}>
                  {startDate ? startDate.toLocaleDateString() : "Select Date"}
                </Text>
              </View>
              <Calendar size={16} color={startDate ? "#6366f1" : "#94a3b8"} />
            </GlassView>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDatePicker("end")}
            className="flex-1">
            <GlassView
              intensity={20}
              className={`flex-row items-center justify-between px-3 py-2.5 rounded-xl border ${
                endDate
                  ? "bg-indigo-500/20 border-indigo-500/50"
                  : "bg-white/40 dark:bg-white/5 border-black/5 dark:border-white/10"
              }`}>
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase">
                  To
                </Text>
                <Text
                  className={`text-xs font-bold ${
                    endDate
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}>
                  {endDate ? endDate.toLocaleDateString() : "Select Date"}
                </Text>
              </View>
              <Calendar size={16} color={endDate ? "#6366f1" : "#94a3b8"} />
            </GlassView>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4 Kanban Column Tabs */}
      <View className="flex-row px-4 pb-4 gap-1.5">
        {columns.map(
          (col) => (
            <TouchableOpacity
              key={col.status}
              onPress={() => {
                setActiveTab(col.status);
                const pageIndex = columns.findIndex((c) => c.status === col.status);
                if (pageIndex !== -1) {
                  scrollViewRef.current?.scrollTo({ x: pageIndex * screenWidth, animated: true });
                }
              }}
              className={`flex-1 py-2.5 rounded-2xl border items-center ${
                activeTab === col.status
                  ? "bg-white border-white"
                  : "bg-white/10 border-white/5"
              }`}>
              <Text
                className={`font-bold capitalize text-[11px] ${
                  activeTab === col.status
                    ? "text-slate-900"
                    : "text-slate-500 dark:text-slate-300"
                }`}>
                {col.label}
              </Text>
              <View
                className={`mt-1 px-1.5 py-0.5 rounded-full ${
                  activeTab === col.status
                    ? "bg-slate-100"
                    : "bg-black/5 dark:bg-white/10"
                }`}>
                <Text
                  className={`text-[10px] font-bold ${
                    activeTab === col.status
                      ? "text-slate-900"
                      : "text-slate-500 dark:text-white"
                  }`}>
                  {tasks.filter((t) => t.status === col.status).length}
                </Text>
              </View>
            </TouchableOpacity>
          ),
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const pageIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          if (columns[pageIndex]) {
            setActiveTab(columns[pageIndex].status);
          }
        }}
        contentContainerStyle={{ width: screenWidth * columns.length }}
      >
        {columns.map((col, idx) => {
          const colTasks = tasks
            .filter((t) => t.status === col.status)
            .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter((t) => {
              if (!startDate && !endDate) return true;
              if (!t.dueDate) return false;
              const due = new Date(t.dueDate);
              due.setHours(0, 0, 0, 0);
              if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (due < start) return false;
              }
              if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (due > end) return false;
              }
              return true;
            })
            .sort((a, b) => {
              const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
              const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
              return dateA - dateB;
            });

          return (
            <View key={col.status} style={{ width: screenWidth }}>
              {/* Header inside column showing page indicator */}
              <View className="px-4 py-2 flex-row justify-between items-center bg-slate-100/50 dark:bg-white/5 mx-4 rounded-xl border border-black/5 dark:border-white/5 mb-3">
                <Text className={`font-bold ${col.color}`}>
                  {col.label} ({colTasks.length})
                </Text>
                <Text className="text-xs font-semibold text-slate-400">
                  {idx + 1} / 4
                </Text>
              </View>

              <FlatList
                data={colTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 150 }}
                ListEmptyComponent={
                  <View className="items-center justify-center py-20">
                    <List size={64} color="rgba(255,255,255,0.2)" />
                    <Text className="text-slate-400 mt-4 font-medium text-lg">
                      No tasks in {col.label}
                    </Text>
                  </View>
                }
              />
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-28 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center border border-indigo-500 z-50"
        onPress={() => setIsModalOpen(true)}>
        <Plus color="white" size={30} />
      </TouchableOpacity>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
      />

      {showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === "start"
              ? startDate || new Date()
              : endDate || new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onDateChange}
          maximumDate={
            showDatePicker === "start" && endDate ? endDate : undefined
          }
          minimumDate={
            showDatePicker === "end" && startDate ? startDate : undefined
          }
        />
      )}
      {undoItem && undoItem.type === "task" && (
        <View className="absolute bottom-40 left-6 right-6 z-50">
          <GlassView
            intensity={40}
            className="flex-row items-center justify-between p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-lg shadow-black/40">
            <View>
              <Text className="text-white font-bold text-sm">Task deleted</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Undo within 10 seconds</Text>
            </View>
            <TouchableOpacity
              onPress={undoLastDelete}
              className="bg-indigo-500 px-4 py-2 rounded-xl border border-white/20">
              <Text className="text-white font-bold text-sm">Undo</Text>
            </TouchableOpacity>
          </GlassView>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default TasksScreen;
