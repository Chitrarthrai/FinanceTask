import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
// SafeAreaView is handled inside ScreenWrapper mostly, or we use standard safe area views
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";
import {
  Settings,
  LayoutDashboard,
  Wallet,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  CreditCard,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  ArrowUpRight,
  MoreVertical,
} from "lucide-react-native";
import { BarChart, PieChart, LineChart } from "react-native-gifted-charts";
import AddTransactionModal from "../components/AddTransactionModal";

const screenWidth = Dimensions.get("window").width;

const KPICard = ({ data }: { data: any }) => {
  const iconMap: any = {
    wallet: Wallet,
    "trending-up": TrendingUp,
    "piggy-bank": Wallet, // Fallback
    "alert-circle": AlertCircle,
    "credit-card": CreditCard,
    "dollar-sign": DollarSign,
  };

  const Icon = iconMap[data.icon] || LayoutDashboard;

  const getColor = (colorName: string) => {
    switch (colorName) {
      case "emerald":
        return "bg-emerald-500";
      case "rose":
        return "bg-rose-500";
      case "amber":
        return "bg-amber-500";
      case "indigo":
        return "bg-indigo-500";
      case "brand":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <GlassView
      intensity={30}
      className={`p-4 rounded-3xl mb-4 mr-4 w-[160px] overflow-hidden border-white/20`}>
      {/* Background tint based on color, but subtle */}
      <View
        className={`absolute inset-0 opacity-20 dark:opacity-20 ${getColor(
          data.color,
        )}`}
      />

      <Icon size={28} color="white" className="mb-3" />
      <Text className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wider">
        {data.label}
      </Text>
      <Text className="text-white text-2xl font-bold">
        {data.currency ? "$" : ""}
        {typeof data.value === "number"
          ? data.value.toLocaleString()
          : data.value}
      </Text>
    </GlassView>
  );
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { transactions, tasks, metrics, refreshData } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("Week");

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const kpiData = [
    {
      label: "Monthly Salary",
      value: metrics.totalIncome,
      currency: true,
      icon: "wallet",
      color: "emerald",
    },
    {
      label: "Fixed Expenses",
      value: metrics.totalFixedExpenses,
      currency: true,
      icon: "credit-card",
      color: "rose",
    },
    {
      label: "Pocket Money",
      value: metrics.pocketMoneyPool,
      currency: true,
      icon: "piggy-bank",
      color:
        metrics.budgetHealth === "Critical"
          ? "rose"
          : metrics.budgetHealth === "At Risk"
            ? "amber"
            : "blue",
    },
    {
      label: "Daily Limit",
      value: metrics.dailyLimit,
      currency: true,
      icon: "dollar-sign",
      color: "brand",
    },
    {
      label: "Variable (Est)",
      value: metrics.totalVariableExpenses,
      currency: true,
      icon: "trending-up",
      color: "amber",
    },
    {
      label: "Savings Target",
      value: metrics.totalSavings,
      currency: true,
      icon: "trending-up",
      color: "indigo",
    },
  ];

  const recentTransactions = transactions.slice(0, 4);
  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .slice(0, 3);

  const percentUsed =
    metrics.dailyLimit > 0
      ? Math.round((metrics.spentToday / metrics.dailyLimit) * 100)
      : 0;

  // Chart Data
  const pieData = useMemo(() => {
    const expenseTrans = transactions.filter((t) => t.type === "expense");
    const grouped = expenseTrans.reduce(
      (acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const colors = [
      "#f97316",
      "#ef4444",
      "#3b82f6",
      "#10b981",
      "#8b5cf6",
      "#f59e0b",
    ]; // brand, red, blue, emerald, violet, amber

    return Object.entries(grouped).map(([name, value], index) => ({
      value,
      color: colors[index % colors.length],
      text: name, // For legend if needed
      focused: index === 0,
    }));
  }, [transactions]);

  const lineData = useMemo(() => {
    const data = [];
    const today = new Date();
    let loops = 7;
    let mode = "day"; // "day" or "month"

    if (timeRange === "Week") {
      loops = 7;
    } else if (timeRange === "Month") {
      loops = 30; // Last 30 days
    } else if (timeRange === "Year") {
      loops = 12; // Last 12 months
      mode = "month";
    }

    // For optimization in daily view, we might want to reduce points or just show them all
    // Gifted Charts handles scrolling well usually.

    for (let i = loops - 1; i >= 0; i--) {
      const d = new Date();
      let dateKey = "";
      let label = "";

      if (mode === "month") {
        d.setMonth(today.getMonth() - i);
        // Format: "Oct 2024" for key matching? Or just Month
        dateKey = d.toLocaleDateString("en-US", { month: "short" }); // "Oct"
        label = d.toLocaleDateString("en-US", { month: "short" });
      } else {
        d.setDate(today.getDate() - i);
        dateKey = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }); // "Oct 12, 2024"
        label = d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });
      }

      const total = transactions
        .filter((t) => {
          if (t.type !== "expense") return false;
          const tDate = new Date(t.date);
          if (mode === "month") {
            // Check matching month and year
            return (
              tDate.getMonth() === d.getMonth() &&
              tDate.getFullYear() === d.getFullYear()
            );
          } else {
            // Check exact date string match as stored
            return t.date === dateKey;
          }
        })
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        value: total,
        label: i % (mode === "month" ? 1 : 4) === 0 ? label : "", // Show label every 4th day for daily view to avoid crowding
        dataPointText: total > 0 && loops <= 12 ? total.toString() : "", // Only show values if not too crowded
      });
    }
    return data;
  }, [transactions, timeRange]);

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-6 py-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Good Morning!
            </Text>
            <Text className="text-slate-500 dark:text-slate-300 mt-1">
              You have{" "}
              <Text className="font-bold text-amber-500 dark:text-amber-400 text-lg">
                ${Math.max(0, metrics.remainingToday).toFixed(2)}
              </Text>{" "}
              left.
            </Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setIsModalOpen(true)}
              className="p-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40 border border-white/20">
              <Plus size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              className="p-3 bg-white/40 dark:bg-white/10 rounded-full border border-black/5 dark:border-white/20 backdrop-blur-md">
              <Settings size={22} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* KPIs - Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 -mx-6 px-6">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} data={kpi} />
          ))}
        </ScrollView>

        {/* Daily Limit Progress */}
        <GlassView
          intensity={40}
          className="p-6 rounded-3xl mb-8 relative overflow-hidden bg-white/40 dark:bg-black/20">
          <View className="flex-row justify-between items-center mb-4 relative z-10">
            <Text className="text-slate-800 dark:text-white text-lg font-bold">
              Daily Limit
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${
                percentUsed >= 100
                  ? "bg-rose-500"
                  : "bg-indigo-100 dark:bg-white/20"
              }`}>
              <Text
                className={`text-xs font-bold ${
                  percentUsed >= 100
                    ? "text-white"
                    : "text-indigo-600 dark:text-white"
                }`}>
                {percentUsed}% Used
              </Text>
            </View>
          </View>
          <View className="flex-row items-baseline gap-2 mb-4 relative z-10">
            <Text className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
              ${metrics.spentToday.toFixed(0)}
            </Text>
            <Text className="text-slate-500 dark:text-white/50 text-xl font-medium">
              / ${metrics.dailyLimit.toFixed(0)}
            </Text>
          </View>
          <View className="h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative z-10">
            <View
              style={{ width: `${Math.min(100, percentUsed)}%` }}
              className={`h-full rounded-full ${
                percentUsed >= 100
                  ? "bg-rose-500"
                  : "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
              }`}
            />
          </View>

          {/* Decor */}
          <View className="absolute top-[-30] right-[-30] w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/30 rounded-full blur-3xl opacity-50" />
        </GlassView>

        {/* Spending Chart */}
        <GlassView
          intensity={40}
          className="mb-8 p-5 rounded-3xl bg-white/40 dark:bg-black/10">
          <View className="flex-row justify-between items-center mb-6 ml-2 mr-2">
            <View>
              <Text className="text-xl font-bold text-slate-800 dark:text-white">
                Spending Analysis
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Your spending trend over time
              </Text>
            </View>
            <View className="flex-row bg-slate-200 dark:bg-white/10 rounded-lg p-1">
              {["Week", "Month", "Year"].map((range) => (
                <TouchableOpacity
                  key={range}
                  onPress={() => {
                    console.log("Filter Pressed:", range);
                    setTimeRange(range);
                  }}
                  className={`px-3 py-1.5 rounded-md ${
                    timeRange === range
                      ? "bg-white dark:bg-white/20 shadow-sm"
                      : "transparent"
                  }`}>
                  <Text
                    className={`text-xs font-semibold ${
                      timeRange === range
                        ? "text-indigo-600 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                    }`}>
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <LineChart
            data={lineData}
            color="#f97316"
            thickness={3}
            dataPointsColor="#f97316"
            startFillColor="rgba(249, 115, 22, 0.3)"
            endFillColor="rgba(249, 115, 22, 0.01)"
            startOpacity={0.9}
            endOpacity={0.2}
            initialSpacing={20}
            noOfSections={4}
            yAxisTextStyle={{ color: "#94a3b8" }}
            xAxisLabelTextStyle={{ color: "#94a3b8" }}
            hideRules
            curved
            isAnimated
            width={screenWidth - 80}
          />
        </GlassView>

        {/* Category Pie Chart */}
        <GlassView
          intensity={40}
          className="mb-8 p-5 rounded-3xl bg-white/40 dark:bg-black/10">
          <Text className="text-xl font-bold text-slate-800 dark:text-white mb-6 ml-2">
            Categories
          </Text>
          <View className="items-center">
            <PieChart
              data={pieData}
              donut
              showText={false} // Text can be messy if too many slices
              radius={100}
              innerRadius={60}
              innerCircleColor={"transparent"}
              centerLabelComponent={() => (
                <View className="items-center justify-center">
                  <Text className="text-xs text-slate-500 dark:text-slate-300">
                    Total
                  </Text>
                  <Text className="text-xl font-bold text-slate-800 dark:text-white">
                    $
                    {metrics.totalVariableExpenses + metrics.totalFixedExpenses}
                  </Text>
                </View>
              )}
            />
          </View>
          <View className="flex-row flex-wrap justify-center gap-4 mt-6">
            {pieData.map((d, i) => (
              <View key={i} className="flex-row items-center gap-2">
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: d.color,
                  }}
                />
                <Text className="text-xs text-slate-600 dark:text-slate-300 capitalize">
                  {d.text}
                </Text>
              </View>
            ))}
          </View>
        </GlassView>

        {/* Upcoming Tasks */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              Upcoming Tasks
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("TasksTab")}>
              <Text className="text-indigo-600 dark:text-indigo-300 font-medium">
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <GlassView
                key={task.id}
                intensity={20}
                className="p-4 rounded-2xl flex-row items-center gap-3 mb-3 border-white/10">
                <View
                  className={`p-2 rounded-xl ${
                    task.priority === "high"
                      ? "bg-rose-500/20"
                      : "bg-indigo-500/20"
                  }`}>
                  <CheckSquare
                    size={20}
                    color={task.priority === "high" ? "#fb7185" : "#818cf8"}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-bold text-slate-800 dark:text-white text-base"
                    numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Clock size={12} color="#94a3b8" />
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      {task.dueDate}
                    </Text>
                  </View>
                </View>
                <View
                  className={`px-2 py-1 rounded-md ${
                    task.priority === "high"
                      ? "bg-rose-500/20 border border-rose-500/30"
                      : "bg-amber-500/20 border border-amber-500/30"
                  }`}>
                  <Text
                    className={`text-[10px] font-bold ${
                      task.priority === "high"
                        ? "text-rose-300"
                        : "text-amber-300"
                    }`}>
                    {task.priority.toUpperCase()}
                  </Text>
                </View>
              </GlassView>
            ))
          ) : (
            <Text className="text-slate-400 italic ml-2">
              No upcoming tasks.
            </Text>
          )}

          <TouchableOpacity
            onPress={() => setIsModalOpen(true)} // Or navigate to Tasks and open modal there? For now let's reuse Quick Add or just Add Task
            className="mt-4 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl p-3 flex-row justify-center items-center gap-2 active:bg-slate-100 dark:active:bg-white/5">
            <Plus size={18} color="#94a3b8" />
            <Text className="text-slate-500 dark:text-slate-400 font-medium">
              Add New Task
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("TransactionsTab")}>
              <Text className="text-indigo-600 dark:text-indigo-300 font-medium">
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((t) => (
            <GlassView
              key={t.id}
              intensity={25}
              className="flex-row items-center justify-between p-4 rounded-2xl mb-2 border-white/10">
              <View className="flex-row items-center gap-4">
                <View
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    t.type === "expense"
                      ? "bg-rose-500/20"
                      : "bg-emerald-500/20"
                  }`}>
                  {t.type === "expense" ? (
                    <ArrowUpRight
                      size={20}
                      color={t.type === "expense" ? "#fb7185" : "#34d399"}
                    />
                  ) : (
                    <ArrowUpRight
                      size={20}
                      color="#34d399"
                      style={{ transform: [{ rotate: "180deg" }] }}
                    />
                  )}
                </View>
                <View>
                  <Text className="font-bold text-slate-800 dark:text-white text-lg">
                    {t.title}
                  </Text>
                  <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.date} • {t.category}
                  </Text>
                </View>
              </View>
              <Text
                className={`font-bold text-lg ${
                  t.type === "expense"
                    ? "text-slate-900 dark:text-white"
                    : "text-emerald-500 dark:text-emerald-400"
                }`}>
                {t.type === "expense" ? "-" : "+"}${t.amount.toFixed(2)}
              </Text>
            </GlassView>
          ))}
        </View>
      </ScrollView>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </ScreenWrapper>
  );
};

export default DashboardScreen;
