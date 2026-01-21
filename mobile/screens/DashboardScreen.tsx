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
import { useColorScheme } from "nativewind";
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
      className="p-4 rounded-3xl mb-4 mr-4 w-[160px] overflow-hidden">
      {/* Background tint based on color, but subtle */}
      <View
        className={`absolute inset-0 ${getColor(data.color)}`}
        style={{ opacity: 0.2 }}
      />

      <Icon size={28} color="white" className="mb-3" />
      <Text
        style={{ color: "rgba(255,255,255,0.8)" }}
        className="text-xs font-medium mb-1 uppercase tracking-wider">
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
  const { colorScheme } = useColorScheme();

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
              style={{
                padding: 12,
                backgroundColor: "#6366f1",
                borderRadius: 9999,
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}>
              <Plus size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={{
                padding: 12,
                backgroundColor:
                  colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "#ffffff",
                borderRadius: 9999,
                borderWidth: 1,
                borderColor:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.05)",
                ...(colorScheme !== "dark"
                  ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }
                  : {}),
              }}>
              <Settings
                size={22}
                color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* KPIs - Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6 -mx-6"
          contentContainerStyle={{ paddingHorizontal: 24 }}>
          {kpiData.map((kpi, index) => (
            <KPICard key={index} data={kpi} />
          ))}
        </ScrollView>

        {/* Daily Limit Progress */}
        <GlassView
          intensity={40}
          className="p-6 rounded-3xl mb-8 relative overflow-hidden">
          <View className="flex-row justify-between items-center mb-4 relative z-10">
            <Text className="text-slate-800 dark:text-white text-lg font-bold">
              Daily Limit
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor:
                  percentUsed >= 100 ? "#f43f5e" : "rgba(255,255,255,0.2)",
              }}>
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
            <Text
              style={{ color: "rgba(255,255,255,0.5)" }}
              className="text-xl font-medium">
              / ${metrics.dailyLimit.toFixed(0)}
            </Text>
          </View>
          <View
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            className="h-3 rounded-full overflow-hidden relative z-10">
            <View
              style={[
                { width: `${Math.min(100, percentUsed)}%` },
                percentUsed >= 100
                  ? { backgroundColor: "#f43f5e" }
                  : {
                      backgroundColor: "#6366f1",
                      shadowColor: "#6366f1",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6,
                      shadowRadius: 15,
                    },
              ]}
              className="h-full rounded-full"
            />
          </View>

          {/* Decor */}
          <View
            style={{ backgroundColor: "rgba(99,102,241,0.3)", opacity: 0.5 }}
            className="absolute top-[-30] right-[-30] w-40 h-40 rounded-full"
          />
        </GlassView>

        {/* Spending Chart */}
        <GlassView intensity={40} className="mb-8 p-5 rounded-3xl">
          <View className="flex-row justify-between items-center mb-6 ml-2 mr-2">
            <View>
              <Text className="text-xl font-bold text-slate-800 dark:text-white">
                Spending Analysis
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Your spending trend over time
              </Text>
            </View>
            <View
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              className="flex-row rounded-lg p-1">
              {["Week", "Month", "Year"].map((range) => (
                <TouchableOpacity
                  key={range}
                  onPress={() => {
                    console.log("Filter Pressed:", range);
                    setTimeRange(range);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    ...(timeRange === range
                      ? {
                          backgroundColor: "rgba(255,255,255,0.2)",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                        }
                      : {}),
                  }}>
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
        <GlassView intensity={40} className="mb-8 p-5 rounded-3xl">
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
                className="p-4 rounded-2xl flex-row items-center gap-3 mb-3">
                <View
                  className="p-2 rounded-xl"
                  style={{
                    backgroundColor:
                      task.priority === "high"
                        ? "rgba(244,63,94,0.2)"
                        : "rgba(99,102,241,0.2)",
                  }}>
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
            onPress={() => setIsModalOpen(true)}
            style={{
              marginTop: 16,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "rgba(255,255,255,0.2)",
              borderRadius: 12,
              padding: 12,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}>
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
              className="flex-row items-center justify-between p-4 rounded-2xl mb-2">
              <View className="flex-row items-center gap-4">
                <View
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor:
                      t.type === "expense"
                        ? "rgba(244,63,94,0.2)"
                        : "rgba(16,185,129,0.2)",
                  }}>
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
