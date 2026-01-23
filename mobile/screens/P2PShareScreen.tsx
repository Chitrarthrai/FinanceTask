import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

export default function P2PShareScreen() {
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
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          P2P File Transfer
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-8">
          Send files securely directly between devices.
        </Text>

        {!mode ? (
          // Mode Selection
          <View className="flex-1 justify-center space-y-6">
            <TouchableOpacity
              className="bg-blue-500 dark:bg-blue-600 p-6 rounded-2xl flex-row items-center justify-between shadow-lg shadow-blue-500/30"
              onPress={() => {
                setMode("send");
                handleStartSending();
              }}>
              <View>
                <Text className="text-white text-xl font-bold">Send File</Text>
                <Text className="text-blue-100 mt-1">
                  Generate a code to share
                </Text>
              </View>
              <Send size={32} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-100 dark:bg-slate-800 p-6 rounded-2xl flex-row items-center justify-between border border-gray-200 dark:border-slate-700"
              onPress={() => setMode("receive")}>
              <View>
                <Text className="text-gray-900 dark:text-white text-xl font-bold">
                  Receive File
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 mt-1">
                  Enter a code from sender
                </Text>
              </View>
              <Download size={32} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        ) : (
          // Active Mode UI
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                onPress={() => {
                  setMode(null);
                  cleanup();
                }}>
                <Text className="text-blue-500 dark:text-blue-400 font-medium">
                  ← Back to Menu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  cleanup();
                  setRoomId(mode === "send" ? generateRoomId() : "");
                }}
                className="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                <Text className="text-red-500 dark:text-red-400 font-medium text-sm">
                  Cancel / Refresh
                </Text>
              </TouchableOpacity>
            </View>

            {mode === "send" ? (
              <View className="items-center">
                <View className="bg-blue-50 dark:bg-blue-900/20 w-full p-8 rounded-3xl items-center border border-dashed border-blue-200 dark:border-blue-700 mb-8">
                  <Text className="text-gray-500 dark:text-gray-400 mb-2">
                    Your Room ID
                  </Text>
                  <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                    {roomId}
                  </Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Share this code with the receiver
                  </Text>
                </View>

                {/* File Selection */}
                <TouchableOpacity
                  onPress={pickFile}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 w-full p-4 rounded-xl flex-row items-center mb-6 shadow-sm">
                  <View className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg mr-4">
                    <FileText size={24} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-semibold text-gray-900 dark:text-white"
                      numberOfLines={1}>
                      {selectedFile
                        ? selectedFile.name
                        : "Select a file to send"}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedFile
                        ? `${(selectedFile.size! / 1024 / 1024).toFixed(2)} MB`
                        : "Tap to browse files"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Status & Action */}
                <View className="w-full">
                  <View className="flex-row items-center mb-4 justify-center space-x-2">
                    <View
                      className={`w-3 h-3 rounded-full ${status === "connected" || status === "transferring" || status === "completed" ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    <Text className="text-gray-600 dark:text-gray-300 font-medium capitalize">
                      {status === "idle" ? "Waiting for receiver..." : status}
                    </Text>
                  </View>

                  {/* SENDER PROGRESS BAR */}
                  {status === "transferring" && (
                    <View className="w-full mb-4 px-2">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600 dark:text-gray-400 font-medium">
                          Sending...
                        </Text>
                        <Text className="text-blue-600 dark:text-blue-400 font-bold">
                          {Math.round(progress)}%
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-blue-500 dark:bg-blue-600"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                    </View>
                  )}

                  {status === "connected" && selectedFile && (
                    <TouchableOpacity
                      className="bg-blue-600 dark:bg-blue-500 w-full py-4 rounded-xl items-center shadow-lg shadow-blue-500/30"
                      onPress={sendFile}>
                      <Text className="text-white font-bold text-lg">
                        Send File
                      </Text>
                    </TouchableOpacity>
                  )}

                  {status === "completed" && (
                    <View className="w-full bg-green-50 dark:bg-green-900/20 p-4 rounded-xl items-center border border-green-200 dark:border-green-800">
                      <CheckCircle size={28} color="#10B981" />
                      <Text className="text-green-700 dark:text-green-300 font-bold mt-2">
                        File Sent Successfully!
                      </Text>
                    </View>
                  )}
                </View>

                {(status === "idle" ||
                  status === "waiting" ||
                  status === "connecting") && (
                  <TouchableOpacity onPress={cleanup} className="mt-4">
                    <Text className="text-red-500 dark:text-red-400 font-medium">
                      Cancel Connection
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Enter Room ID
                </Text>

                <View className="flex-row space-x-4 mb-8">
                  <TextInput
                    className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-6 py-4 text-2xl font-bold tracking-widest text-center w-full text-slate-900 dark:text-white"
                    placeholder="XXXXXX"
                    placeholderTextColor="#9ca3af"
                    value={roomId}
                    onChangeText={(t) => setRoomId(t.toUpperCase())}
                    maxLength={6}
                    autoCapitalize="characters"
                  />
                </View>

                {status === "idle" && (
                  <TouchableOpacity
                    className="bg-blue-600 dark:bg-blue-500 w-full py-4 rounded-xl items-center"
                    onPress={handleConnectReceiver}>
                    <Text className="text-white font-bold text-lg">
                      Connect
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Status Display for Receiver */}
                {status !== "idle" && (
                  <View className="w-full bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl items-center mt-4 border border-gray-100 dark:border-slate-800">
                    {status === "transferring" && (
                      <View className="w-full mb-4">
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-gray-600 dark:text-gray-400 font-medium">
                            Downloading...
                          </Text>
                          <Text className="text-blue-600 dark:text-blue-400 font-bold">
                            {Math.round(progress)}%
                          </Text>
                        </View>
                        <View className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-blue-500 dark:bg-blue-600"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                      </View>
                    )}

                    {status === "completed" && (
                      <View className="items-center w-full">
                        <View className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                          <CheckCircle size={32} color="#10B981" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                          Transfer Complete!
                        </Text>

                        <TouchableOpacity
                          className="bg-gray-900 dark:bg-white w-full py-4 rounded-xl items-center flex-row justify-center space-x-2"
                          onPress={saveReceivedFile}>
                          <Download
                            size={20}
                            color={Platform.OS === "ios" ? "white" : "#111827"}
                          />
                          <Text className="text-white dark:text-slate-900 font-bold text-lg ml-2">
                            Save / Share File
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {status === "connecting" && (
                      <View className="flex-row items-center space-x-3">
                        <ActivityIndicator color="#3B82F6" />
                        <Text className="text-gray-500 dark:text-gray-400">
                          Connecting to peer...
                        </Text>
                      </View>
                    )}

                    {status === "connected" && (
                      <View className="flex-row items-center space-x-3">
                        <Smartphone size={24} color="#10B981" />
                        <Text className="text-green-600 dark:text-green-400 font-medium">
                          Connected! Transfer starting...
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  onPress={cleanup}
                  className="mt-8 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl items-center w-full">
                  <Text className="text-red-500 dark:text-red-400 font-bold">
                    Cancel / Reset
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
