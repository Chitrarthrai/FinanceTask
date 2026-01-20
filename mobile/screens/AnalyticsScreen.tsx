import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";

// ... existing code ...

const StatCard = ({ label, value, sub, icon: Icon, color, bg }: any) => (
  <GlassView
    intensity={20}
    className="flex-1 p-4 rounded-2xl border-white/10 shadow-none mr-2 mb-2 min-w-[45%]">
    <View className="flex-row justify-between items-start mb-2">
      <Text className="text-[10px] font-bold text-slate-300 uppercase">
        {label}
      </Text>
      <View className={`p-2 rounded-lg ${bg} opacity-90`}>
        <Icon size={14} color="white" />
      </View>
    </View>
    <Text className={`text-lg font-extrabold ${color}`}>{value}</Text>
    {sub && <Text className="text-xs text-slate-400 mt-1">{sub}</Text>}
  </GlassView>
);
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { PieChart, BarChart, LineChart } from "react-native-gifted-charts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  BrainCircuit,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";

const AnalyticsScreen = () => {
  const { user } = useAuth();
  const { getAnalyticsData, getSmartInsights } = useData();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data State
  const [metrics, setMetrics] = useState<any>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  // Derived Stats
  const [stats, setStats] = useState({
    totalSpent: 0,
    avgDaily: 0,
    highestSpend: 0,
    highestCategory: "N/A",
    savingsRate: 0,
  });

  const selectedMonthStr = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    loadData();
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-01`;

      const {
        metrics: m,
        distribution: d,
        trend: t,
      } = await getAnalyticsData(monthStr);
      const i = await getSmartInsights(monthStr);

      setMetrics(m);

      // Process Data matching Web Logic
      const totalSpent = m?.total_expenses || 0;
      const daysInMonth = 30; // Approximation as per web
      const avgDaily = totalSpent / daysInMonth;
      const maxSpend =
        d.length > 0 ? Math.max(...d.map((x: any) => x.value)) : 0;
      const topCat =
        d.sort((a: any, b: any) => b.value - a.value)[0]?.name || "N/A";
      const savingsRate = m?.total_income
        ? (m.net_savings / m.total_income) * 100
        : 0;

      setStats({
        totalSpent,
        avgDaily,
        highestSpend: maxSpend,
        highestCategory: topCat,
        savingsRate,
      });

      // Chart Formats
      const formattedDist = d.map((item: any) => ({
        value: item.value,
        text: `${Math.round((item.value / (totalSpent || 1)) * 100)}%`,
        color: item.color || "#f97316",
        label: item.name,
      }));
      setDistribution(formattedDist);

      const formattedTrend = t.map((item: any) => ({
        value: item.amount,
        label: item.day_label,
        dataPointText: Math.round(item.amount).toString(),
      }));
      setTrend(formattedTrend);

      setInsights(i || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (val: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + val);
    setCurrentDate(newDate);
  };

  const handleExport = async () => {
    if (!metrics) {
      Alert.alert("No Data", "There is no data to export for this month.");
      return;
    }

    setLoading(true);
    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              h1 { color: #4f46e5; text-align: center; margin-bottom: 10px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
              .date { font-size: 14px; color: #666; }
              .grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
              .card { flex: 1; min-width: 45%; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
              .label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
              .value { font-size: 24px; font-weight: bold; color: #1e293b; }
              .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>FinanceTask Analytics</h1>
              <div class="date">Report for ${selectedMonthStr}</div>
            </div>

            <div class="grid">
              <div class="card">
                <div class="label">Total Spent</div>
                <div class="value" style="color: #ef4444;">$${stats.totalSpent.toLocaleString()}</div>
              </div>
              <div class="card">
                <div class="label">Total Income</div>
                <div class="value" style="color: #10b981;">$${metrics.total_income?.toLocaleString() || "0"}</div>
              </div>
              <div class="card">
                <div class="label">Net Savings</div>
                <div class="value" style="color: #4f46e5;">$${metrics.net_savings?.toLocaleString() || "0"}</div>
              </div>
              <div class="card">
                <div class="label">Savings Rate</div>
                <div class="value">${stats.savingsRate.toFixed(1)}%</div>
              </div>
            </div>

            <h3>Top Spending Category</h3>
            <p><strong>${stats.highestCategory}</strong> with $${stats.highestSpend.toLocaleString()}</p>

            <div class="footer">
              Generated by FinanceTask App
            </div>
          </body>
        </html>
      `;

      const { uri } = await printToFileAsync({ html });

      let finalUri = uri;
      try {
        const lastIndex = uri.lastIndexOf("/");
        if (lastIndex !== -1) {
          const directory = uri.substring(0, lastIndex + 1);
          const fileName = `FinanceTask_Analytics_${selectedMonthStr.replace(/ /g, "_")}.pdf`;
          const newUri = directory + fileName;

          await FileSystem.moveAsync({
            from: uri,
            to: newUri,
          });
          finalUri = newUri;
        }
      } catch (e) {
        console.error("Renaming failed", e);
      }

      await shareAsync(finalUri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error: any) {
      Alert.alert("Export Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, sub, icon: Icon, color, bg }: any) => (
    <GlassView
      intensity={20}
      className={`flex-1 p-4 rounded-2xl border-white/10 shadow-none mr-2 mb-2 min-w-[45%] bg-white/40 dark:bg-white/5`}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase">
          {label}
        </Text>
        <View className={`p-2 rounded-lg ${bg} opacity-90`}>
          <Icon size={14} color="white" />
        </View>
      </View>
      <Text className={`text-lg font-extrabold ${color}`}>{value}</Text>
      {sub && (
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {sub}
        </Text>
      )}
    </GlassView>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-6 py-6">
          <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 shadow-black/20 shadow-offset-[0px_2px]">
            Financial Analytics
          </Text>
          <Text className="text-slate-600 dark:text-indigo-200 font-medium mb-6">
            Deep dive into your spending habits.
          </Text>

          {/* Month Picker */}
          <View className="flex-row justify-between items-center mb-6">
            <GlassView
              intensity={20}
              className="flex-row items-center rounded-xl border border-black/5 dark:border-white/20 p-1 bg-white/40 dark:bg-white/5">
              <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
                <ChevronLeft size={20} color={isDark ? "white" : "#475569"} />
              </TouchableOpacity>
              <View className="flex-row items-center px-4 border-l border-r border-black/5 dark:border-white/10 h-full">
                <Calendar size={16} color={isDark ? "#cbd5e1" : "#64748b"} />
                <Text className="ml-2 font-bold text-slate-900 dark:text-white">
                  {selectedMonthStr}
                </Text>
              </View>
              <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
                <ChevronRight size={20} color={isDark ? "white" : "#475569"} />
              </TouchableOpacity>
            </GlassView>

            <TouchableOpacity
              onPress={handleExport}
              className="flex-row items-center bg-indigo-500 px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/40 border border-white/20">
              <Download size={18} color="white" />
              <Text className="text-white font-bold ml-2">Export</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#a5b4fc" className="mt-10" />
          ) : (
            <>
              {/* Summary Stats Grid */}
              <View className="flex-row flex-wrap mb-6">
                <StatCard
                  label="Total Spent"
                  value={`$${stats.totalSpent.toLocaleString()}`}
                  icon={DollarSign}
                  color="text-emerald-400"
                  bg="bg-emerald-500"
                />
                <StatCard
                  label="Avg. Daily"
                  value={`$${stats.avgDaily.toFixed(0)}`}
                  icon={Target}
                  color="text-amber-400"
                  bg="bg-amber-500"
                />
                <StatCard
                  label="Highest Spend"
                  value={`$${stats.highestSpend.toLocaleString()}`}
                  sub={stats.highestCategory}
                  icon={TrendingUp}
                  color="text-rose-400"
                  bg="bg-rose-500"
                />
                <StatCard
                  label="Savings Rate"
                  value={`${stats.savingsRate.toFixed(1)}%`}
                  icon={TrendingDown}
                  color="text-emerald-400"
                  bg="bg-emerald-500"
                />
              </View>

              {/* Income vs Expense Bar Chart */}
              <GlassView
                intensity={30}
                className="p-4 rounded-3xl border border-black/5 dark:border-white/10 mb-6 bg-white/40 dark:bg-white/5">
                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 ml-2">
                  Income vs Expenses
                </Text>
                {metrics && (
                  <BarChart
                    data={[
                      {
                        value: metrics.total_income,
                        label: "Income",
                        frontColor: "#34d399", // Emerald-400
                        spacing: 20,
                      },
                      {
                        value: metrics.total_expenses,
                        label: "Expense",
                        frontColor: "#fb7185", // Rose-400
                      },
                    ]}
                    barWidth={40}
                    barBorderRadius={8}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    hideRules
                    height={200}
                    width={300}
                    initialSpacing={20}
                    yAxisTextStyle={{ color: "#9ca3af" }}
                    xAxisLabelTextStyle={{ color: "#9ca3af" }}
                  />
                )}
              </GlassView>

              {/* Spending by Category Pie */}
              <GlassView
                intensity={30}
                className="p-4 rounded-3xl border border-black/5 dark:border-white/10 mb-6 bg-white/40 dark:bg-white/5">
                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 ml-2">
                  Spending by Category
                </Text>
                {distribution.length > 0 ? (
                  <View className="items-center">
                    <PieChart
                      data={distribution}
                      donut
                      radius={100}
                      innerRadius={70}
                      innerCircleColor={"transparent"}
                      centerLabelComponent={() => (
                        <View className="items-center">
                          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${stats.totalSpent}
                          </Text>
                          <Text className="text-slate-500 dark:text-slate-400 text-xs">
                            Total
                          </Text>
                        </View>
                      )}
                    />
                    {/* Legend */}
                    <View className="flex-row flex-wrap justify-center gap-3 mt-6">
                      {distribution.map((d, i) => (
                        <View key={i} className="flex-row items-center">
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor: d.color,
                              borderRadius: 5,
                              marginRight: 5,
                            }}
                          />
                          <Text className="text-xs text-slate-600 dark:text-slate-300">
                            {d.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text className="text-slate-400 text-center">No data</Text>
                )}
              </GlassView>

              {/* Weekly Trend */}
              <GlassView
                intensity={30}
                className="p-4 rounded-3xl border border-black/5 dark:border-white/10 mb-6 bg-white/40 dark:bg-white/5">
                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4 ml-2">
                  Daily Spending Trend
                </Text>
                {trend.length > 0 ? (
                  <LineChart
                    data={trend}
                    color="#fbbf24" // Amber-400
                    thickness={3}
                    startFillColor="#fbbf24"
                    endFillColor="#fbbf24"
                    startOpacity={0.2}
                    endOpacity={0.05}
                    areaChart
                    curved
                    hideRules
                    hideDataPoints={false}
                    dataPointsColor="#fbbf24"
                    yAxisThickness={0}
                    xAxisThickness={0}
                    height={180}
                    spacing={40}
                    initialSpacing={10}
                    yAxisTextStyle={{ color: "#9ca3af", fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: "#9ca3af", fontSize: 10 }}
                  />
                ) : (
                  <Text className="text-slate-400 text-center">
                    No trending data
                  </Text>
                )}
              </GlassView>

              {/* Smart Insights */}
              <GlassView
                intensity={40}
                className="p-6 rounded-3xl mb-6 shadow-xl shadow-black/20 border-white/20 bg-indigo-50/50 dark:bg-indigo-900/20">
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                    <BrainCircuit
                      size={20}
                      color={isDark ? "#a5b4fc" : "#6366f1"}
                    />
                  </View>
                  <Text className="text-xl font-bold text-slate-900 dark:text-white">
                    Smart Insights
                  </Text>
                </View>

                {insights.length > 0 ? (
                  insights.map((insight: any, idx) => (
                    <View key={idx} className="mb-4 last:mb-0">
                      <Text className="text-amber-600 dark:text-amber-300 font-bold mb-1">
                        {insight.title}:
                      </Text>
                      <Text className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm opacity-90">
                        {insight.message}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-slate-400 italic">
                    Start tracking to see AI insights here...
                  </Text>
                )}
              </GlassView>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AnalyticsScreen;
