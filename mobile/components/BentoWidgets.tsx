import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GlassView } from "./ui/GlassView";
import { Camera, Plus, CheckSquare, BellRing } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { useColorScheme } from "nativewind";
import { Task } from "../types";

// --- QUICK ACTIONS WIDGET ---
interface QuickActionsWidgetProps {
  onScanReceipt: () => void;
  onAddTransaction: () => void;
  onAddTask: () => void;
}

export const QuickActionsWidget = ({
  onScanReceipt,
  onAddTransaction,
  onAddTask,
}: QuickActionsWidgetProps) => {
  return (
    <GlassView intensity={30} className="p-4 flex-1 justify-between bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl min-h-[140px]">
      <Text className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">
        Quick Shortcuts
      </Text>
      <View className="flex-row justify-around items-center gap-3">
        <TouchableOpacity
          testID="btn-scan-receipt"
          onPress={onScanReceipt}
          className="w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center border border-indigo-500">
          <Camera size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          testID="btn-open-add-tx"
          onPress={onAddTransaction}
          className="w-12 h-12 rounded-2xl bg-cyan-600 items-center justify-center border border-cyan-500">
          <Plus size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          testID="btn-open-add-task"
          onPress={onAddTask}
          className="w-12 h-12 rounded-2xl bg-violet-600 items-center justify-center border border-violet-500">
          <CheckSquare size={20} color="white" />
        </TouchableOpacity>
      </View>
      <Text className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium mt-1">
        Tap to trigger action
      </Text>
    </GlassView>
  );
};

// --- BUDGET CIRCLE PROGRESS WIDGET ---
interface BudgetCircleWidgetProps {
  todaySpent: number;
  dailyLimit: number;
}

export const BudgetCircleWidget = ({ todaySpent, dailyLimit }: BudgetCircleWidgetProps) => {
  const { colorScheme } = useColorScheme();
  const limit = dailyLimit || 2000; 
  const percentage = Math.min(100, Math.max(0, (todaySpent / limit) * 100));
  const isOver = todaySpent > limit;

  // Circle properties
  const radius = 28;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // High contrast track stroke color dynamically based on theme
  const trackStrokeColor = colorScheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)";

  return (
    <GlassView intensity={30} className="p-4 flex-1 justify-between bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30 rounded-3xl min-h-[140px]">
      <Text className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
        Daily Limit
      </Text>
      <View className="flex-row items-center justify-between my-1">
        <View className="flex-1 mr-2">
          <Text className="text-xl font-black text-slate-900 dark:text-white leading-none">
            ${todaySpent.toFixed(0)}
          </Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
            of ${limit.toFixed(0)} limit
          </Text>
        </View>
        <View className="items-center justify-center w-16 h-16">
          <Svg width={64} height={64} className="rotate-[-90deg]">
            {/* Background Circle */}
            <Circle
              cx={32}
              cy={32}
              r={radius}
              stroke={trackStrokeColor}
              strokeWidth={stroke}
              fill="transparent"
            />
            {/* Foreground Progress */}
            <Circle
              cx={32}
              cy={32}
              r={radius}
              stroke={isOver ? "#f43f5e" : "#06b6d4"}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </Svg>
          <View className="absolute">
            <Text className={`text-[10px] font-black ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>
      <Text className={`text-[9px] font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {isOver ? "⚠️ Over limit!" : `${(100 - percentage).toFixed(0)}% remaining`}
      </Text>
    </GlassView>
  );
};

// --- PRIORITY TASKS WIDGET ---
interface PriorityTasksWidgetProps {
  tasks: Task[];
  onNavigateToTasks: () => void;
}

export const PriorityTasksWidget = ({ tasks, onNavigateToTasks }: PriorityTasksWidgetProps) => {
  const highPriority = tasks
    .filter((t) => t.status === "todo" || t.status === "in-progress")
    .sort((a, b) => (b.priority === "high" ? 1 : -1))
    .slice(0, 2);

  return (
    <TouchableOpacity onPress={onNavigateToTasks} activeOpacity={0.95} className="w-full">
      <GlassView intensity={30} className="p-4 bg-slate-500/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-3xl min-h-[120px] justify-between">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            Next Alarms & Tasks
          </Text>
          <Text className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
            View All
          </Text>
        </View>
        {highPriority.length === 0 ? (
          <Text className="text-slate-500 dark:text-slate-400 text-xs italic py-2">No pending items</Text>
        ) : (
          <View className="gap-2">
            {highPriority.map((task) => (
              <View key={task.id} className="flex-row items-center gap-2">
                <View className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <Text className="text-xs font-semibold text-slate-800 dark:text-white flex-1" numberOfLines={1}>
                  {task.title}
                </Text>
                {task.dueDate && (
                  <Text className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </GlassView>
    </TouchableOpacity>
  );
};

// --- CATEGORY BUDGET LIMIT ALERTS WIDGET ---
interface CategoryAlertsWidgetProps {
  warnings: string[];
}

export const CategoryAlertsWidget = ({ warnings }: CategoryAlertsWidgetProps) => {
  return (
    <GlassView intensity={30} className="p-4 bg-slate-500/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-3xl min-h-[100px] justify-between">
      <View className="flex-row items-center gap-2 mb-2">
        <BellRing size={14} color="#818cf8" />
        <Text className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
          Budget Limit Alerts
        </Text>
      </View>
      {warnings.length === 0 ? (
        <Text className="text-slate-500 dark:text-slate-400 text-xs italic font-medium py-1">
          All category budgets are under control.
        </Text>
      ) : (
        <View className="gap-1.5">
          {warnings.slice(0, 2).map((warn, index) => (
            <Text key={index} className="text-xs text-rose-600 dark:text-rose-400 font-bold" numberOfLines={1}>
              ⚠️ {warn}
            </Text>
          ))}
        </View>
      )}
    </GlassView>
  );
};
