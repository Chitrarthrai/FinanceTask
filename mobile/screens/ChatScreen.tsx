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
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#6366f1",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}>
            <Bot size={16} color="white" />
          </View>
        )}

        {isUser ? (
          <View
            style={{
              maxWidth: "85%",
              padding: 14,
              borderRadius: 16,
              borderTopRightRadius: 0,
              backgroundColor: "#6366f1",
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}>
            <Text className="text-[15px] leading-5 text-white font-medium">
              {item.text}
            </Text>
          </View>
        ) : (
          <GlassView
            intensity={20}
            className="max-w-[85%] p-3.5 rounded-2xl rounded-tl-none"
            style={
              isTool
                ? { borderLeftWidth: 4, borderLeftColor: "#6366f1" }
                : undefined
            }>
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
        className="px-4 py-3 flex-row items-center z-10">
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(99,102,241,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: "rgba(99,102,241,0.3)",
          }}>
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
        <View
          style={{
            padding: 12,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}>
          <GlassView
            intensity={20}
            className="flex-row items-center rounded-full px-1">
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
              style={{
                margin: 4,
                padding: 10,
                borderRadius: 9999,
                backgroundColor: !inputText.trim()
                  ? "rgba(255,255,255,0.1)"
                  : "#6366f1",
                ...(inputText.trim()
                  ? {
                      shadowColor: "#6366f1",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 8,
                    }
                  : {}),
              }}>
              <Send size={18} color="white" />
            </TouchableOpacity>
          </GlassView>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default ChatScreen;
