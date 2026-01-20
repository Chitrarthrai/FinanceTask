import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {
  X,
  Check,
  Calendar,
  DollarSign,
  Tag,
  Camera,
  Receipt,
} from "lucide-react-native";
import { GlassView } from "./ui/GlassView";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Transaction } from "../types";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { parseReceiptImage } from "../utils/gemini";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

const CATEGORIES = [
  { name: "Food", icon: "coffee", color: "bg-orange-100 text-orange-600" },
  { name: "Transport", icon: "car", color: "bg-blue-100 text-blue-600" },
  {
    name: "Shopping",
    icon: "shopping-bag",
    color: "bg-pink-100 text-pink-600",
  },
  { name: "Housing", icon: "home", color: "bg-purple-100 text-purple-600" },
  {
    name: "Income",
    icon: "dollar-sign",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "Others",
    icon: "more-horizontal",
    color: "bg-gray-100 text-gray-600",
  },
];

const AddTransactionModal = ({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
}: AddTransactionModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setTitle(transactionToEdit.title);
      setAmount(transactionToEdit.amount.toString());
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setDate(new Date(transactionToEdit.date));
      setReceiptUri(transactionToEdit.receipt_url || null); // Note: We might need to handle if it's a relative path vs full URL.
    } else {
      resetForm();
    }
  }, [transactionToEdit, isOpen]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Food");
    setDate(new Date());
    setReceiptUri(null);
  };

  const pickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera roll permissions to make this work!",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setReceiptUri(uri);
      analyzeReceipt(uri);
    }
  };

  const analyzeReceipt = async (uri: string) => {
    setScanning(true);
    try {
      const result = await parseReceiptImage(uri);

      if (result) {
        if (result.merchantName) setTitle(result.merchantName);
        if (result.amount) setAmount(result.amount.toString());
        if (result.category) {
          // Simple category matching
          const matchedCat = CATEGORIES.find(
            (c) => c.name.toLowerCase() === result.category?.toLowerCase(),
          );
          if (matchedCat) setCategory(matchedCat.name);
          else setCategory("Others");
        }
        if (result.type) setType(result.type);
        if (result.date) setDate(new Date(result.date));

        Alert.alert("Receipt Scanned", "Details updated from receipt!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Scan Failed",
        "Could not analyze receipt. Please enter details manually.",
      );
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      let receiptPath = transactionToEdit?.receipt_url || "";

      // Upload Receipt if changed and is a local file (file://)
      if (receiptUri && receiptUri.startsWith("file://")) {
        const base64 = await FileSystem.readAsStringAsync(receiptUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const fileExt = receiptUri.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, decode(base64), {
            contentType: "image/jpeg",
          });

        if (uploadError) throw uploadError;
        receiptPath = fileName;
      }

      const payload = {
        user_id: user.id,
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: date.toISOString(),
        receipt_url: receiptPath,
        payment_method: "Cash", // Default
      };

      if (transactionToEdit) {
        const { error } = await supabase
          .from("transactions")
          .update(payload)
          .eq("id", transactionToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transactions").insert({
          ...payload,
          id: Math.random().toString(36).substr(2, 9),
        });
        if (error) throw error;
      }

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
          className="bg-white/95 dark:bg-slate-900/90 rounded-t-3xl h-[90%] border-t border-black/5 dark:border-white/20">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-black/5 dark:border-white/10">
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-slate-100 dark:bg-white/10 rounded-full">
              <X size={20} color={user ? "#64748b" : "white"} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
              {transactionToEdit ? "Edit Transaction" : "New Transaction"}
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || scanning}
              className="p-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40">
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Check size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            {/* AI Scan Button */}
            {!transactionToEdit && (
              <TouchableOpacity
                onPress={pickImage}
                disabled={scanning}
                className="flex-row items-center justify-center p-4 mb-6 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-400/50">
                {scanning ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#818cf8"
                      className="mr-2"
                    />
                    <Text className="text-indigo-600 dark:text-indigo-300 font-bold">
                      Scanning Receipt...
                    </Text>
                  </>
                ) : (
                  <>
                    <Receipt size={20} color="#6366f1" className="mr-2" />
                    <Text className="text-indigo-600 dark:text-indigo-300 font-bold">
                      Scan Receipt with AI
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {receiptUri && (
              <View className="mb-6 items-center">
                <Image
                  source={{ uri: receiptUri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "rgba(148,163,184,0.2)",
                  }}
                />
                <TouchableOpacity onPress={() => setReceiptUri(null)}>
                  <Text className="text-xs text-rose-400 mt-2 font-medium">
                    Remove Receipt
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Amount Input */}
            <View className="mb-8 items-center">
              <Text className="text-slate-500 dark:text-slate-400 font-medium mb-2 uppercase tracking-widest text-xs">
                Amount
              </Text>
              <View className="flex-row items-center">
                <Text className="text-3xl font-bold text-indigo-500 dark:text-indigo-400 mr-1">
                  $
                </Text>
                <TextInput
                  className="text-5xl font-bold text-slate-900 dark:text-white min-w-[100px] text-center"
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="rgba(148,163,184,0.4)"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus={!transactionToEdit && !scanning}
                />
              </View>
            </View>

            {/* Type Switcher */}
            <View className="flex-row bg-slate-100 dark:bg-black/20 p-1 rounded-2xl mb-6 border border-black/5 dark:border-white/5">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${
                  type === "expense"
                    ? "bg-rose-100 dark:bg-rose-500/20 shadow-sm border border-rose-200 dark:border-rose-500/30"
                    : ""
                }`}
                onPress={() => setType("expense")}>
                <Text
                  className={`font-bold ${
                    type === "expense"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-500"
                  }`}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${
                  type === "income"
                    ? "bg-emerald-100 dark:bg-emerald-500/20 shadow-sm border border-emerald-200 dark:border-emerald-500/30"
                    : ""
                }`}
                onPress={() => setType("income")}>
                <Text
                  className={`font-bold ${
                    type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500"
                  }`}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title Input */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Title
              </Text>
              <TextInput
                className="bg-white dark:bg-white/5 p-4 rounded-xl text-slate-900 dark:text-white font-medium border border-slate-100 dark:border-white/10 text-base"
                placeholder="What is this for?"
                placeholderTextColor="rgba(148,163,184,0.5)"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category Grid */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => setCategory(cat.name)}
                    className={`px-4 py-2 rounded-xl border ${
                      category === cat.name
                        ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/40"
                        : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10"
                    }`}>
                    <Text
                      className={`font-medium ${
                        category === cat.name
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Picker */}
            <View className="mb-8">
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10">
                <Calendar size={20} color="#94a3b8" className="mr-3" />
                <Text className="text-slate-900 dark:text-white font-medium text-base">
                  {date.toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                themeVariant="dark"
                onChange={(event: any, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </ScrollView>
        </GlassView>
      </View>
    </Modal>
  );
};

export default AddTransactionModal;
