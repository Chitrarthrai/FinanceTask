import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  LogBox,
} from "react-native";
import { ScreenWrapper } from "../components/ui/ScreenWrapper";

LogBox.ignoreLogs(["[Reanimated]"]); // Ignore noisy animation warnings
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import {
  FileText,
  Send,
  Download,
  CheckCircle,
  Smartphone,
} from "lucide-react-native";
import { SignalingClient } from "../lib/p2p/Signaling";
import { MobileWebRTCClient } from "../lib/p2p/MobileWebRTCClient";
import { useColorScheme } from "nativewind";

export default function P2PShareScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [mode, setMode] = useState<"send" | "receive" | null>(null);
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("idle"); // idle, connecting, connected, transferring, completed
  const [progress, setProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState<{
    uri: string;
    meta: any;
  } | null>(null);

  // Sender state
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const signalingRef = useRef<SignalingClient | null>(null);
  const webrtcRef = useRef<MobileWebRTCClient | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      cleanup();
    };
  }, []);

  const cleanup = () => {
    webrtcRef.current?.close();
    signalingRef.current?.leaveRoom();
    setStatus("idle");
    setProgress(0);
  };

  const generateRoomId = () => {
    // Generate a simple 6-char ID
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const initializeP2P = async (isSender: boolean, roomToJoin: string) => {
    try {
      cleanup();
      setStatus(isSender ? "waiting" : "connecting");

      const signaling = new SignalingClient();
      signalingRef.current = signaling;

      const webrtc = new MobileWebRTCClient(signaling);
      webrtcRef.current = webrtc;

      // Setup callbacks
      webrtc.onStatus = (s) => {
        console.log("WebRTC Status:", s);
        if (s === "connected") {
          setStatus("connected");
        }
      };

      webrtc.onProgress = (p) => {
        setStatus("transferring");
        setProgress(p);
      };

      webrtc.onFileReceived = (uri, meta) => {
        setStatus("completed");
        setReceivedFile({ uri, meta });
        Alert.alert("Success", `Received file: ${meta.name}`);
      };

      // Join room
      await signaling.joinRoom(roomToJoin, async (type, payload) => {
        if (isSender && type === "new-peer") {
          console.log("Sender: New peer joined! Creating offer...");
          await webrtc.initialize(true);
        } else {
          webrtc.handleSignal(type, payload);
        }
      });

      if (!isSender) {
        console.log("Receiver: Announcing presence...");
        await signaling.sendSignal("new-peer", {});
        await webrtc.initialize(false);
      }
    } catch (error) {
      console.error("Failed to init P2P", error);
      Alert.alert("Error", "Failed to connect to room.");
      setStatus("idle");
    }
  };

  const handleStartSending = async () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    await initializeP2P(true, newRoomId);
  };

  const handleConnectReceiver = async () => {
    if (roomId.length !== 6) {
      Alert.alert("Invalid ID", "Please enter a valid 6-character Room ID.");
      return;
    }
    await initializeP2P(false, roomId.toUpperCase());
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error("Error picking file", err);
    }
  };

  const sendFile = async () => {
    if (!selectedFile || !webrtcRef.current) return;
    try {
      await webrtcRef.current.sendFile(selectedFile.uri, {
        name: selectedFile.name,
        size: selectedFile.size || 0,
        type: selectedFile.mimeType || "application/octet-stream",
      });
    } catch (error) {
      console.error("Error sending file", error);
      Alert.alert("Error", "Failed to send file.");
    }
  };

  const saveReceivedFile = async () => {
    if (!receivedFile) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(receivedFile.uri);
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Sharing error", error);
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 p-6">
        <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          P2P Share
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          Secure, direct file transfer.
        </Text>

        {!mode ? (
          // Mode Selection
          <View className="flex-1 justify-center">
            <TouchableOpacity
              activeOpacity={0.8}
              className="mb-8"
              onPress={() => {
                setMode("send");
                handleStartSending();
              }}>
              <LinearGradient
                colors={
                  isDark ? ["#6366f1", "#a855f7"] : ["#ffffff", "#f8fafc"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 24 }}
                className={`p-6 rounded-3xl flex-row items-center justify-between shadow-xl ${isDark ? "shadow-indigo-500/30 border border-white/10" : "border border-slate-200 shadow-slate-200"}`}>
                <View>
                  <Text
                    className={`${isDark ? "text-white" : "text-slate-900"} text-2xl font-bold mb-1`}>
                    Send File
                  </Text>
                  <Text
                    className={`${isDark ? "text-indigo-100" : "text-slate-500"} font-medium`}>
                    Create a room
                  </Text>
                </View>
                <View
                  className={`${isDark ? "bg-white/20" : "bg-indigo-50"} p-3 rounded-2xl`}>
                  <Send size={32} color={isDark ? "white" : "#6366f1"} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode("receive")}>
              <LinearGradient
                colors={
                  isDark ? ["#1e293b", "#0f172a"] : ["#ffffff", "#f1f5f9"]
                }
                style={{ borderRadius: 24 }}
                className={`p-6 rounded-3xl flex-row items-center justify-between shadow-xl ${isDark ? "border border-slate-700" : "border border-slate-200 shadow-slate-200"}`}>
                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-900"} text-2xl font-bold mb-1`}>
                    Receive File
                  </Text>
                  <Text className="text-slate-500 font-medium">
                    Join a room
                  </Text>
                </View>
                <View
                  className={`${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"} p-3 rounded-2xl border`}>
                  <Download size={32} color="#94a3b8" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          // Active Mode UI
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity
                onPress={() => {
                  setMode(null);
                  cleanup();
                }}
                className="flex-row items-center bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                <Text className="text-slate-300 font-bold mr-2">Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  cleanup();
                  setRoomId(mode === "send" ? generateRoomId() : "");
                }}
                className="bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                <Text className="text-red-400 font-bold text-xs uppercase tracking-wider">
                  Reset
                </Text>
              </TouchableOpacity>
            </View>

            {mode === "send" ? (
              <View className="items-center">
                <View className="w-full relative mb-8 group">
                  <View className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25"></View>
                  <View className="bg-slate-900 w-full p-8 rounded-[1.8rem] items-center border border-slate-700 relative">
                    <Text className="text-slate-400 mb-4 font-medium uppercase tracking-widest text-xs">
                      Share Code
                    </Text>
                    <Text className="text-5xl font-mono font-bold text-white tracking-[0.2em]">
                      {roomId}
                    </Text>
                  </View>
                </View>

                {/* File Selection */}
                <TouchableOpacity
                  onPress={pickFile}
                  className="w-full bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex-row items-center mb-8 active:bg-slate-800 transition-colors">
                  <View className="bg-slate-700/50 p-4 rounded-xl mr-4">
                    <FileText size={28} color="#e2e8f0" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-bold text-lg text-white mb-1"
                      numberOfLines={1}>
                      {selectedFile ? selectedFile.name : "Select File"}
                    </Text>
                    <Text className="text-sm text-slate-400">
                      {selectedFile
                        ? `${(selectedFile.size! / 1024 / 1024).toFixed(2)} MB`
                        : "Tap to browse documents"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Status & Action */}
                <View className="w-full">
                  {/* SENDER PROGRESS BAR */}
                  {status === "transferring" && (
                    <View className="w-full mb-6 max-w-sm mx-auto">
                      <View className="flex-row justify-between mb-3">
                        <Text className="text-slate-300 font-bold">
                          Sending...
                        </Text>
                        <Text className="text-indigo-400 font-mono font-bold">
                          {Math.round(progress)}%
                        </Text>
                      </View>
                      <View className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <LinearGradient
                          colors={["#6366f1", "#a855f7"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="h-full rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                    </View>
                  )}

                  {status === "connected" && selectedFile && (
                    <TouchableOpacity
                      className="w-full mt-4"
                      activeOpacity={0.8}
                      onPress={sendFile}>
                      <LinearGradient
                        colors={["#4f46e5", "#7c3aed"]} // Indigo to Purple
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 24 }}
                        className="w-full py-4 px-6 rounded-3xl flex-row items-center justify-center shadow-lg shadow-indigo-500/40 border border-white/20">
                        <Text className="text-white font-bold text-xl mr-3 tracking-wide">
                          Send Now
                        </Text>
                        <View className="bg-white/20 p-2 rounded-full">
                          <Send size={20} color="white" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {status === "completed" && (
                    <View className="w-full bg-green-500/10 p-6 rounded-2xl items-center border border-green-500/20">
                      <CheckCircle size={40} color="#34d399" />
                      <Text className="text-green-400 font-bold text-xl mt-3">
                        Sent Successfully
                      </Text>
                    </View>
                  )}
                </View>

                <View className="mt-8 flex-row items-center space-x-2">
                  <View
                    className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-500" : "bg-slate-600"}`}
                  />
                  <Text className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                    Status: {status}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center w-full">
                <Text className="text-2xl font-bold text-white mb-8 text-center">
                  Enter Code
                </Text>

                <TextInput
                  className="bg-slate-900 border border-slate-700 rounded-2xl px-8 py-6 text-4xl font-mono font-bold tracking-[0.3em] text-center w-full text-white mb-8 selection:bg-indigo-500/30"
                  placeholder="XXXXXX"
                  placeholderTextColor="#334155"
                  value={roomId}
                  onChangeText={(t) => setRoomId(t.toUpperCase())}
                  maxLength={6}
                  autoCapitalize="characters"
                />

                {status === "idle" && (
                  <TouchableOpacity
                    className="w-full"
                    onPress={handleConnectReceiver}>
                    <LinearGradient
                      colors={["#6366f1", "#4f46e5"]}
                      className="w-full py-5 rounded-2xl items-center shadow-xl shadow-indigo-500/20">
                      <Text className="text-white font-bold text-xl">
                        Connect & Download
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Status Display for Receiver */}
                {status !== "idle" && (
                  <View className="w-full bg-slate-800/40 p-6 rounded-3xl items-center mt-6 border border-slate-700/50 backdrop-blur-md">
                    {status === "transferring" && (
                      <View className="w-full">
                        <View className="flex-row justify-between mb-3">
                          <Text className="text-slate-300 font-bold">
                            Downloading...
                          </Text>
                          <Text className="text-indigo-400 font-mono font-bold">
                            {Math.round(progress)}%
                          </Text>
                        </View>
                        <View className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                          <LinearGradient
                            colors={["#3b82f6", "#0ea5e9"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-full rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                      </View>
                    )}

                    {status === "completed" && (
                      <View className="items-center w-full">
                        <View className="bg-green-500/20 p-5 rounded-full mb-6">
                          <CheckCircle size={48} color="#34d399" />
                        </View>
                        <Text className="text-2xl font-bold text-white mb-8">
                          Download Complete
                        </Text>

                        <TouchableOpacity
                          className="bg-white w-full py-5 rounded-2xl items-center flex-row justify-center space-x-3 shadow-xl"
                          onPress={saveReceivedFile}>
                          <Download size={24} color="#0f172a" />
                          <Text className="text-slate-900 font-bold text-lg ml-2">
                            Save File
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {status === "connecting" && (
                      <View className="py-8 items-center">
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text className="text-slate-400 mt-4 font-medium animate-pulse">
                          Searching for peer...
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
