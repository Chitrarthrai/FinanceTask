import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";
import { GlassView } from "../components/ui/GlassView";
import { Send, Bot, User as UserIcon } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { buildFinancialContext } from "../utils/contextBuilder";
import { chatWithGemini, ChatMessage } from "../utils/geminiChat";

// Simple Typing Indicator Component
const TypingIndicator = () => {
  const [dots] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    dots.forEach((dot, index) => animate(dot, index * 150));
  }, []);

  return (
    <View className="flex-row items-center space-x-1 px-2 py-1">
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={{
            opacity: dot,
            transform: [
              {
                translateY: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              },
            ],
          }}
          className="w-1.5 h-1.5 bg-slate-400 rounded-full mx-0.5"
        />
      ))}
    </View>
  );
};

const ChatScreen = () => {
  const { user } = useAuth();
  const {
    transactions,
    metrics,
    budgetSettings,
    tasks,
    categories,
    addTransaction,
    addTask,
  } = useData();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: "Hello! I'm your AI financial advisor. Ask me anything about your spending, or tell me to add transactions and reminders.",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const userMsg = {
      id: Date.now().toString(),
      text: userText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const context = buildFinancialContext(
        transactions,
        metrics,
        budgetSettings,
        tasks,
        categories,
      );

      let response = await chatWithGemini([], userText, context);

      while (response.functionCall) {
        const { name, args } = response.functionCall;
        let resultFn = { success: false, message: "Unknown function" };
        let displayMsg = "";

        try {
          if (name === "addTransaction") {
            await addTransaction({
              ...args,
              id: Math.random().toString(),
              date: args.date || new Date().toISOString(),
              paymentMethod: "Cash",
              receipt_url: null,
            });
            displayMsg = `✅ Added: ${args.title} ($${args.amount})`;
            resultFn = {
              success: true,
              message: `Transaction added: ${args.title}`,
            };
          } else if (name === "createTask") {
            await addTask({
              ...args,
              id: Math.random().toString(),
              status: "todo",
              tags: [],
              category: "Personal",
            });
            displayMsg = `✅ Task: ${args.title}`;
            resultFn = {
              success: true,
              message: `Task created: ${args.title}`,
            };
          }
        } catch (err: any) {
          resultFn = { success: false, message: `Error: ${err.message}` };
          displayMsg = `❌ Error: ${err.message}`;
        }

        if (displayMsg) {
          const toolMsg = {
            id: Date.now().toString() + Math.random(),
            text: displayMsg,
            sender: "bot",
            isTool: true,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, toolMsg]);
        }

        response = await chatWithGemini([], "", context, {
          name,
          response: resultFn,
        });
      }

      if (response.text) {
        const botMsg = {
          id: Date.now().toString(),
          text: response.text,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error(error);
      const botMsg = {
        id: Date.now().toString(),
        text: "I'm having trouble connecting right now. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUser = item.sender === "user";
    const isTool = item.isTool;

    return (
      <View
        className={`flex-row mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center mr-2 shadow-lg shadow-indigo-500/30 border border-white/20">
            <Bot size={16} color="white" />
          </View>
        )}

        {isUser ? (
          <View className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-none bg-indigo-500 shadow-lg shadow-indigo-500/30 border border-white/20">
            <Text className="text-[15px] leading-5 text-white font-medium">
              {item.text}
            </Text>
          </View>
        ) : (
          <GlassView
            intensity={20}
            className={`max-w-[85%] p-3.5 rounded-2xl rounded-tl-none border border-black/5 dark:border-white/10 ${
              isTool
                ? "bg-white/40 dark:bg-white/5 border-l-4 border-l-indigo-500 dark:border-l-indigo-400"
                : "bg-white/40 dark:bg-white/10"
            }`}>
            <Text className="text-[15px] leading-5 text-slate-800 dark:text-slate-100">
              {item.text}
            </Text>
          </GlassView>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <GlassView
        intensity={30}
        className="px-4 py-3 border-b border-black/5 dark:border-white/10 flex-row items-center z-10 bg-white/40 dark:bg-white/5">
        <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 items-center justify-center mr-3 border border-indigo-200 dark:border-indigo-500/30">
          <Bot size={18} color="#6366f1" />
        </View>
        <Text className="text-lg font-bold text-slate-800 dark:text-white flex-1 tracking-wide">
          Financial Assistant
        </Text>
      </GlassView>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          loading ? (
            <View className="flex-row items-center mb-4 ml-10">
              <GlassView
                intensity={10}
                className="px-4 py-3 rounded-2xl rounded-tl-none border-white/10">
                <TypingIndicator />
              </GlassView>
            </View>
          ) : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        className="mb-[90px]">
        <View className="p-3 border-t border-black/5 dark:border-white/10 bg-white/10 dark:bg-black/20 rounded-b-3xl">
          <GlassView
            intensity={20}
            className="flex-row items-center rounded-full px-1 border border-black/5 dark:border-white/20 bg-white/40 dark:bg-white/5">
            <TextInput
              className="flex-1 text-slate-800 dark:text-white px-4 py-3.5 text-base"
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={loading || !inputText.trim()}
              className={`m-1 p-2.5 rounded-full ${
                !inputText.trim()
                  ? "bg-slate-200 dark:bg-white/10"
                  : "bg-indigo-500 shadow-lg shadow-indigo-500/40"
              }`}>
              <Send size={18} color="white" />
            </TouchableOpacity>
          </GlassView>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default ChatScreen;
