import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { PieChart, BarChart } from "react-native-gifted-charts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  CreditCard,
  Share2,
  Download,
  Calendar,
} from "lucide-react-native";
import { MonthlyMetrics, CategoryDistribution, SpendingTrend } from "../types";

const ReportsScreen = () => {
  const { user } = useAuth();
  const { getAnalyticsData } = useData();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MonthlyMetrics | null>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  const selectedMonthStr = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    loadData();
    loadNotes();
  }, [user, selectedDate]);

  const loadNotes = async () => {
    try {
      const key = `report_notes_${selectedDate.getFullYear()}_${selectedDate.getMonth()}`;
      const savedNotes = await AsyncStorage.getItem(key);
      if (savedNotes) setNotes(savedNotes);
      else setNotes("");
    } catch (e) {
      console.error("Failed to load notes", e);
    }
  };

  const saveNotes = async (text: string) => {
    setNotes(text);
    try {
      const key = `report_notes_${selectedDate.getFullYear()}_${selectedDate.getMonth()}`;
      await AsyncStorage.setItem(key, text);
    } catch (e) {
      console.error("Failed to save notes", e);
    }
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const monthStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-01`;

      const {
        metrics: newMetrics,
        distribution: newDist,
        trend: newTrend,
      } = await getAnalyticsData(monthStr);

      setMetrics(newMetrics);

      // Transform Distribution for Chart
      const formattedDist = newDist.map((d) => ({
        value: d.value,
        color: d.color || "#f97316",
        text: `${Math.round((d.value / (newMetrics?.total_expenses || 1)) * 100)}%`,
        label: d.name,
        amount: d.value,
      }));
      setDistribution(formattedDist);

      // Transform Trend for Chart
      const formattedTrend = newTrend.map((d) => ({
        value: d.amount,
        label: d.day_label, // e.g., "01"
        frontColor: "#f97316",
      }));
      setTrend(formattedTrend);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!metrics) {
      Alert.alert("No Data", "There is no data to export for this month.");
      return;
    }

    setLoading(true);
    try {
      // Generate Category Rows
      const categoryRows = distribution
        .map(
          (d) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 10px; height: 10px; border-radius: 5px; background-color: ${d.color}; margin-right: 8px;"></div>
              ${d.label}
            </div>
          </td>
          <td style="padding: 8px; text-align: right; font-weight: bold;">$${d.amount.toLocaleString()}</td>
          <td style="padding: 8px; text-align: right; color: #666;">${d.text}</td>
        </tr>
      `,
        )
        .join("");

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; }
              .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #6366f1; padding-bottom: 15px; }
              .title { font-size: 24px; font-weight: bold; color: #1e293b; }
              .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
              .badge { background: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
              
              .summary-grid { display: flex; gap: 10px; margin-bottom: 30px; }
              .summary-card { flex: 1; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
              .summary-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px; }
              .summary-val { font-size: 18px; font-weight: bold; }
              
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; margin-top: 30px; color: #334155; }
              
              table { width: 100%; border-collapse: collapse; font-size: 14px; }
              th { text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase; padding: 8px; border-bottom: 1px solid #cbd5e1; }
              
              .notes-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; font-style: italic; color: #92400e; line-height: 1.5; }
              
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">FinanceTask</div>
                <div class="subtitle">Monthly Financial Report</div>
              </div>
              <div class="badge">${selectedMonthStr}</div>
            </div>

            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-label">Total Income</div>
                <div class="summary-val" style="color: #059669;">$${metrics.total_income.toLocaleString()}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Total Expenses</div>
                <div class="summary-val" style="color: #e11d48;">$${metrics.total_expenses.toLocaleString()}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Net Savings</div>
                <div class="summary-val" style="color: #4f46e5;">$${metrics.net_savings.toLocaleString()}</div>
              </div>
            </div>

            <div class="section-title">Expense Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th style="text-align: right;">Amount</th>
                  <th style="text-align: right;">%</th>
                </tr>
              </thead>
              <tbody>
                ${categoryRows}
              </tbody>
            </table>

            ${
              notes
                ? `
              <div class="section-title">Analyst Notes</div>
              <div class="notes-box">"${notes}"</div>
            `
                : ""
            }

            <div class="footer">
              Generated by FinanceTask Mobile
            </div>
          </body>
        </html>
      `;

      const { uri } = await printToFileAsync({ html });

      console.log("FileSystem Keys:", Object.keys(FileSystem));

      let finalUri = uri;
      try {
        const lastIndex = uri.lastIndexOf("/");
        if (lastIndex !== -1) {
          const directory = uri.substring(0, lastIndex + 1);
          const fileName = `FinanceTask_Report_${selectedMonthStr.replace(/ /g, "_")}.pdf`;
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
      console.error("Export Error:", error);
      Alert.alert("Download Failed", error.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header Section */}
          <GlassView
            intensity={40}
            className="mx-4 mt-6 p-6 rounded-3xl border border-black/5 dark:border-white/20 mb-6 relative overflow-hidden bg-white/40 dark:bg-white/5">
            <View className="flex-row justify-between items-start mb-6 w-full">
              <View>
                <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 shadow-black/20 shadow-offset-[0px_2px]">
                  Monthly Report
                </Text>
                <Text className="text-slate-600 dark:text-indigo-200 font-medium tracking-wide">
                  Financial summary for {selectedMonthStr}
                </Text>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleExport}
                  className="p-3 bg-white/40 dark:bg-white/10 rounded-xl border border-black/5 dark:border-white/10">
                  <Share2 size={20} color="#6366f1" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleExport}
                  className="p-3 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/40 border border-white/20">
                  <Download size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <GlassView
              intensity={20}
              className="flex-row justify-between items-center bg-white/50 dark:bg-black/20 p-2 rounded-2xl border border-black/5 dark:border-white/10">
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                className="p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <ChevronLeft size={20} color="#64748b" />
              </TouchableOpacity>
              <View className="flex-row items-center gap-3">
                <View className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
                  <CreditCard size={18} color="#6366f1" />
                </View>
                <Text className="font-bold text-slate-900 dark:text-white text-lg tracking-wide">
                  {selectedMonthStr}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => changeMonth(1)}
                className="p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <ChevronRight size={20} color="#64748b" />
              </TouchableOpacity>
            </GlassView>
          </GlassView>

          {loading ? (
            <View className="h-60 justify-center items-center">
              <ActivityIndicator size="large" color="#a5b4fc" />
            </View>
          ) : (
            <>
              {/* Report Branding Card */}
              <GlassView
                intensity={30}
                className="mx-4 p-6 rounded-3xl border border-black/5 dark:border-white/10 mb-6 bg-white/40 dark:bg-white/5">
                <View className="flex-row items-center justify-between border-b border-black/5 dark:border-white/10 pb-6 mb-6">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-indigo-500 rounded-2xl items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
                      <CreditCard size={24} color="white" />
                    </View>
                    <View>
                      <Text className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                        FinanceTask
                      </Text>
                      <Text className="text-[10px] font-bold text-indigo-500 dark:text-indigo-200 uppercase tracking-widest mt-1">
                        Personal Finance Report
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <GlassView
                      intensity={10}
                      className="flex-row items-center gap-2 bg-white/40 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5">
                      <Calendar size={12} color="#94a3b8" />
                      <Text className="text-xs font-bold text-slate-500 dark:text-slate-300">
                        {selectedMonthStr}
                      </Text>
                    </GlassView>
                  </View>
                </View>

                {/* Key Metrics Cards */}
                {metrics ? (
                  <View className="flex-row justify-between gap-2">
                    <View className="flex-1 space-y-2 bg-white/40 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                      <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Total Income
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                          ${metrics.total_income.toLocaleString()}
                        </Text>
                        <TrendingUp size={12} color="#10b981" />
                      </View>
                    </View>
                    <View className="flex-1 space-y-2 bg-white/40 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                      <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Total Expenses
                      </Text>
                      <Text className="text-lg font-extrabold text-rose-500 dark:text-rose-400">
                        ${metrics.total_expenses.toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-1 space-y-2 bg-white/40 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                      <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Net Savings
                      </Text>
                      <Text className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                        ${metrics.net_savings.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View className="p-6 items-center">
                    <Text className="text-slate-400">
                      No data for this month
                    </Text>
                  </View>
                )}
              </GlassView>

              {/* Spending Trend */}
              <GlassView
                intensity={30}
                className="mx-4 p-5 rounded-3xl border border-black/5 dark:border-white/10 mb-6 bg-white/40 dark:bg-white/5">
                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-6 ml-1">
                  Daily Spending
                </Text>
                {trend && trend.length > 0 ? (
                  <BarChart
                    data={trend}
                    barWidth={18}
                    spacing={14}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: "#9ca3af", fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: "#9ca3af", fontSize: 10 }}
                    noOfSections={3}
                    maxValue={Math.max(...trend.map((t) => t.value), 100) * 1.2}
                    height={150}
                    width={Dimensions.get("window").width - 80}
                    initialSpacing={10}
                    frontColor="#fbbf24" // Amber-400
                  />
                ) : (
                  <Text className="text-slate-400 text-center py-10">
                    No spending data
                  </Text>
                )}
              </GlassView>

              {/* Category Distribution */}
              <GlassView
                intensity={30}
                className="mx-4 mb-6 p-5 rounded-3xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5">
                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-6 w-full text-left">
                  Where your money went
                </Text>
                {distribution && distribution.length > 0 ? (
                  <View>
                    <View className="items-center mb-6">
                      <PieChart
                        data={distribution}
                        donut
                        showGradient
                        sectionAutoFocus
                        radius={90}
                        innerRadius={60}
                        innerCircleColor={"transparent"}
                        centerLabelComponent={() => {
                          return (
                            <View
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                              }}>
                              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                ${metrics?.total_expenses || 0}
                              </Text>
                              <Text className="text-xs text-slate-500 dark:text-slate-400">
                                Total
                              </Text>
                            </View>
                          );
                        }}
                      />
                    </View>

                    {/* Detailed Category List */}
                    <View className="border-t border-black/5 dark:border-white/10 pt-4">
                      <Text className="text-sm font-bold text-slate-500 dark:text-slate-300 mb-4 uppercase tracking-wider">
                        Top Spending Categories
                      </Text>
                      {distribution.map((item, index) => (
                        <View
                          key={index}
                          className="flex-row items-center justify-between mb-3 last:mb-0">
                          <View className="flex-row items-center gap-3">
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: item.color,
                              }}
                            />
                            <Text className="font-medium text-slate-700 dark:text-slate-300">
                              {item.label}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="font-bold text-slate-900 dark:text-white">
                              ${item.amount.toLocaleString()}
                            </Text>
                            <Text className="text-xs text-slate-400">
                              ({item.text})
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text className="text-slate-400 text-center py-10">
                    No category data
                  </Text>
                )}
              </GlassView>

              {/* Analyst Notes */}
              <GlassView
                intensity={20}
                className="mx-4 mb-6 p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5">
                <View className="flex-row items-center gap-2 mb-3">
                  <FileText size={18} color="#fbbf24" />
                  <Text className="font-bold text-amber-600 dark:text-amber-200 uppercase tracking-wide text-xs">
                    Analyst Notes
                  </Text>
                </View>
                <TextInput
                  multiline
                  value={notes}
                  onChangeText={saveNotes}
                  placeholder="Add your notes specific to this month's report..."
                  placeholderTextColor="rgba(148,163,184,0.6)"
                  className="h-32 bg-white/50 dark:bg-black/20 p-4 rounded-xl text-slate-800 dark:text-white font-medium leading-5 border border-black/5 dark:border-white/5"
                  textAlignVertical="top"
                />
              </GlassView>

              <View className="mt-4 mb-10 items-center">
                <Text className="text-xs text-slate-500 font-medium">
                  Generated automatically by FinanceTask
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default ReportsScreen;
