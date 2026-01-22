import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";
import { useData } from "../context/DataContext";
import { Transaction } from "../types";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Trash2,
  Edit,
  X,
  CreditCard,
  ShoppingBag,
  Home,
  Coffee,
  Zap,
  Car,
  DollarSign,
  Music,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import AddTransactionModal from "../components/AddTransactionModal";

const TransactionsScreen = (props: any) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { transactions, deleteTransaction, categories } = useData();
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">(
    "all",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Initialize from params if available
  React.useEffect(() => {
    if ((props.route.params as any)?.search) {
      setSearchQuery((props.route.params as any).search);
      // Optional: Clear params to avoid sticky search?
      // props.navigation.setParams({ search: undefined });
    }
  }, [props.route.params]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewAllDates, setViewAllDates] = useState(true);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      let matchesDate = true;
      if (!viewAllDates) {
        const tDate = new Date(t.date);
        matchesDate =
          tDate.getMonth() === selectedDate.getMonth() &&
          tDate.getFullYear() === selectedDate.getFullYear();
      }

      const matchesType = filterType === "all" ? true : t.type === filterType;
      const matchesCategory =
        selectedCategory === "All" ? true : t.category === selectedCategory;
      const matchesSearch = t.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesDate && matchesType && matchesCategory && matchesSearch;
    });
  }, [
    transactions,
    filterType,
    selectedCategory,
    searchQuery,
    selectedDate,
    viewAllDates,
  ]);

  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, curr) => acc + curr.amount, 0),
    [filteredTransactions],
  );

  const totalExpenses = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, curr) => acc + curr.amount, 0),
    [filteredTransactions],
  );

  const getIcon = (category: string, color: string) => {
    const iconProps = { size: 20, color };
    switch (category.toLowerCase()) {
      case "food":
        return <Coffee {...iconProps} />;
      case "shopping":
        return <ShoppingBag {...iconProps} />;
      case "housing":
        return <Home {...iconProps} />;
      case "utilities":
        return <Zap {...iconProps} />;
      case "transport":
        return <Car {...iconProps} />;
      case "income":
        return <DollarSign {...iconProps} />;
      case "entertainment":
        return <Music {...iconProps} />;
      case "work":
        return <Briefcase {...iconProps} />;
      default:
        return <ShoppingBag {...iconProps} />;
    }
  };

  const categoryNames = ["All", ...new Set(categories.map((c) => c.name))];
  if (!categoryNames.includes("Income")) categoryNames.push("Income");

  const handleDelete = (id: string) => {
    deleteTransaction(id);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity onPress={() => handleEdit(item)} activeOpacity={0.7}>
        <GlassView
          intensity={20}
          className="flex-row items-center justify-between p-4 mb-3 rounded-2xl mx-4 border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5">
          <View className="flex-row items-center gap-4 flex-1">
            <View
              className={`w-12 h-12 rounded-2xl items-center justify-center ${
                item.type === "income"
                  ? "bg-emerald-100 dark:bg-emerald-500/20"
                  : "bg-rose-100 dark:bg-rose-500/20"
              }`}>
              {getIcon(
                item.category,
                item.type === "income" ? "#10b981" : "#f43f5e",
              )}
            </View>
            <View className="flex-1">
              <Text
                className="font-bold text-slate-800 dark:text-white text-base mb-0.5"
                numberOfLines={1}>
                {item.title}
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="bg-white/40 dark:bg-white/10 px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase">
                    {item.category}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
          <View className="items-end">
            <Text
              className={`font-bold text-lg ${
                item.type === "income"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-900 dark:text-white"
              }`}>
              {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {item.paymentMethod ||
                (item.type === "expense" ? "Debit Card" : "Deposit")}
            </Text>
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View className="pb-2 z-10">
        <View className="px-4 py-4 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Transactions
            </Text>
            <Text className="text-slate-500 dark:text-slate-300 text-xs font-medium mt-1">
              {filteredTransactions.length} items found
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedTransaction(null);
              setIsModalOpen(true);
            }}
            className="w-12 h-12 bg-indigo-500 rounded-full items-center justify-center shadow-lg shadow-indigo-500/40 border border-white/20">
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Date Filter */}
        <View className="px-4 mb-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
              setViewAllDates(false); // Enable strict date mode
            }}
            className="p-2 rounded-full bg-white/40 dark:bg-white/10 border border-black/5 dark:border-white/10">
            <ChevronLeft size={20} color={isDark ? "white" : "black"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewAllDates(!viewAllDates)}
            className="items-center px-4 py-1.5 rounded-2xl active:bg-black/5 dark:active:bg-white/10">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              {viewAllDates
                ? "All Time"
                : selectedDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
            </Text>
            <Text className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
              {viewAllDates ? "Tap to Filter" : "Tap to View All"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
              setViewAllDates(false); // Enable strict date mode
            }}
            className="p-2 rounded-full bg-white/40 dark:bg-white/10 border border-black/5 dark:border-white/10">
            <ChevronRight size={20} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-4">
          <GlassView
            intensity={20}
            className="flex-row items-center rounded-2xl px-4 py-3 border border-black/5 dark:border-white/20 bg-white/40 dark:bg-white/10">
            <Search size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search transactions..."
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

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-2">
          {categoryNames.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`mr-2 px-5 py-2.5 rounded-full border ${
                selectedCategory === cat
                  ? "bg-indigo-500 border-indigo-400"
                  : "bg-white/40 dark:bg-white/10 border-black/5 dark:border-white/10"
              }`}>
              <Text
                className={`text-xs font-bold ${
                  selectedCategory === cat
                    ? "text-white"
                    : "text-slate-700 dark:text-slate-300"
                }`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="w-6" />
        </ScrollView>
      </View>

      {/* Summary Stats for Filtered View */}
      {filterType === "all" &&
        selectedCategory === "All" &&
        searchQuery === "" && (
          <View className="flex-row px-4 py-4 gap-3">
            <GlassView
              intensity={30}
              className="flex-1 p-4 rounded-3xl border border-black/5 dark:border-white/10 flex-row items-center justify-between bg-white/40 dark:bg-white/5">
              <View>
                <Text className="text-slate-500 dark:text-slate-300 text-xs font-bold uppercase mb-1">
                  Income
                </Text>
                <Text className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalIncome.toFixed(0)}
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 items-center justify-center">
                <ArrowDownLeft size={20} color="#34d399" />
              </View>
            </GlassView>
            <GlassView
              intensity={30}
              className="flex-1 p-4 rounded-3xl border border-black/5 dark:border-white/10 flex-row items-center justify-between bg-white/40 dark:bg-white/5">
              <View>
                <Text className="text-slate-500 dark:text-slate-300 text-xs font-bold uppercase mb-1">
                  Expense
                </Text>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                  ${totalExpenses.toFixed(0)}
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 items-center justify-center">
                <ArrowUpRight size={20} color="#fb7185" />
              </View>
            </GlassView>
          </View>
        )}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <ShoppingBag size={64} color="rgba(255,255,255,0.2)" />
            <Text className="text-slate-400 mt-4 font-medium text-lg">
              No transactions found.
            </Text>
          </View>
        }
      />

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}} // DataContext updates automatically via subscription or refresh
        transactionToEdit={selectedTransaction}
      />
    </ScreenWrapper>
  );
};

export default TransactionsScreen;
