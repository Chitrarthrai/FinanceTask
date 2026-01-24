import React, { useState, useEffect, useRef } from "react";
import { SignalingClient } from "../lib/p2p/Signaling";
import { WebRTCClient } from "../lib/p2p/WebRTCClient";
import {
  Share2,
  Download,
  Upload,
  Copy,
  Check,
  File as FileIcon,
  Loader2,
} from "lucide-react";

const generateRoomId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const P2PShare = () => {
  const [mode, setMode] = useState<"send" | "receive">("send");
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [receivedFile, setReceivedFile] = useState<{
    blob: Blob;
    meta: any;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const signaling = useRef<SignalingClient | null>(null);
  const webRTC = useRef<WebRTCClient | null>(null);

  useEffect(() => {
    return () => {
      webRTC.current?.close();
      signaling.current?.leaveRoom();
    };
  }, []);

  const initializeP2P = () => {
    console.log("P2P: Initializing P2P clients...");
    // Cleanup previous instances if any
    webRTC.current?.close();
    signaling.current?.leaveRoom();

    const sig = new SignalingClient();
    const rtc = new WebRTCClient(sig);

    rtc.onStatus = (s) => {
      console.log(`P2P: Status changed to ${s}`);
      setStatus(s);
    };
    rtc.onProgress = (p) => setProgress(p);
    rtc.onFileReceived = (blob, meta) => {
      console.log("P2P: File received!", meta);
      setReceivedFile({ blob, meta });
      setStatus("completed");
    };

    signaling.current = sig;
    webRTC.current = rtc;
    return { sig, rtc };
  };

  const startSend = async () => {
    console.log("P2P: startSend clicked");
    const { sig, rtc } = initializeP2P();

    // Slight delay to ensure clean state
    await new Promise((r) => setTimeout(r, 100));

    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setStatus("waiting");

    console.log(`P2P: Generated Room ID ${newRoomId}, joining...`);

    await sig.joinRoom(newRoomId, async (type, payload) => {
      console.log(`P2P: Signal received ${type}`);
      if (type === "new-peer") {
        console.log("Sender: New peer joined! Creating offer...");
        await rtc.initialize(true);
      } else {
        rtc.handleSignal(type, payload);
      }
    });
  };

  const startReceive = async () => {
    console.log("P2P: startReceive clicked with Room ID:", roomId);
    if (!roomId) return;
    const { sig, rtc } = initializeP2P();

    setStatus("connecting");

    console.log("Receiver: Joining room...");

    await sig.joinRoom(roomId, (type, payload) => {
      console.log(`P2P: Signal received ${type}`);
      rtc.handleSignal(type, payload);
    });

    console.log("Receiver: Announcing presence...");
    await sig.sendSignal("new-peer", {});

    // Receiver doesn't initialize initiator=true, just waits for offer
    await rtc.initialize(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("P2P: File selected");
    if (e.target.files && e.target.files[0]) {
      console.log("P2P: File set", e.target.files[0].name);
      setFile(e.target.files[0]);
    }
  };

  const sendFile = () => {
    console.log("P2P: sendFile clicked");
    if (file && status === "connected" && webRTC.current) {
      console.log("P2P: invoking webRTC.sendFile");
      setStatus("sending");
      webRTC.current.sendFile(file);
    } else {
      console.warn(
        "P2P: Cannot send file. Status:",
        status,
        "File:",
        file?.name,
      );
    }
  };

  const downloadFile = () => {
    if (!receivedFile) return;
    const url = URL.createObjectURL(receivedFile.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = receivedFile.meta.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-12 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-brand-50 dark:bg-brand-900/10 rounded-2xl mb-4 ring-1 ring-brand-200 dark:ring-brand-800">
          <Share2 className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold bg-linear-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
          Toffee P2P Share
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          The secure way to send files directly between devices.{" "}
          <br className="hidden sm:block" />
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            Unlimited size. No server storage. End-to-end encrypted.
          </span>
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-full inline-flex relative shadow-inner">
          <button
            onClick={() => {
              setMode("send");
              setStatus("idle");
              setFile(null);
              setRoomId("");
            }}
            className={`relative z-10 flex items-center px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              mode === "send"
                ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}>
            <Upload className="w-4 h-4 mr-2.5" />
            Send File
          </button>
          <button
            onClick={() => {
              setMode("receive");
              setStatus("idle");
              setReceivedFile(null);
              setRoomId("");
            }}
            className={`relative z-10 flex items-center px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              mode === "receive"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}>
            <Download className="w-4 h-4 mr-2.5" />
            Receive File
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="card max-w-xl mx-auto backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-2xl rounded-[2rem] overflow-hidden relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="p-8 lg:p-10 relative z-10">
          {mode === "send" && (
            <div className="space-y-8">
              {!roomId ? (
                <>
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 text-center bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer overflow-hidden">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />

                      <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-brand-500/10">
                        <FileIcon className="w-10 h-10" />
                      </div>

                      {file ? (
                        <div className="animate-fade-in-up">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 break-words mb-1">
                            {file.name}
                          </h3>
                          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors">
                            Drop your file here
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            or click to browse from your device
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Buttons for File Selection Stage */}
                  {file && (
                    <div className="flex flex-col gap-4 mt-6">
                      <button
                        onClick={startSend}
                        className="w-full btn bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white py-4 rounded-xl text-lg font-bold shadow-xl shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-300">
                        Generate Share Code
                      </button>
                      <button
                        onClick={() => {
                          setFile(null);
                          setStatus("idle");
                        }}
                        className="px-6 py-2 rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors w-full">
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 animate-scale-in">
                  <div className="mb-6">
                    <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-xs font-bold uppercase tracking-wider">
                      Share Code
                    </span>
                  </div>

                  <div
                    className="relative group cursor-pointer"
                    onClick={copyRoomId}>
                    <div className="absolute -inset-2 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white dark:bg-slate-800 border-2 border-brand-200 dark:border-brand-800 rounded-xl py-6 px-4 flex items-center justify-center space-x-3">
                      <div className="text-5xl font-mono font-bold tracking-[0.2em] text-slate-800 dark:text-white">
                        {roomId}
                      </div>
                    </div>
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-6 transition-all duration-300">
                      {copied ? (
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="bg-slate-200 dark:bg-slate-700 text-slate-500 p-2 rounded-full shadow-lg">
                          <Copy className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-6">
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setRoomId("");
                        webRTC.current?.close();
                        signaling.current?.leaveRoom();
                      }}
                      className="px-6 py-2 rounded-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors w-full">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* End of !roomId false block */}
              {/* End of !roomId false block */}

              {status === "connected" && (
                <div className="space-y-6 animate-scale-in bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center justify-center space-x-3 text-green-600 dark:text-green-400">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                      <Check className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg">
                      Connected Securely
                    </span>
                  </div>
                  <button
                    onClick={sendFile}
                    className="w-full btn bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 hover:-translate-y-0.5">
                    Start Transfer
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === "receive" && (
            <div className="space-y-8">
              {!receivedFile ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1 uppercase tracking-wide opacity-80">
                      Enter 6-Digit Code
                    </label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) =>
                          setRoomId(e.target.value.toUpperCase())
                        }
                        placeholder="XXXXXX"
                        maxLength={6}
                        className="relative w-full input bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 text-center text-4xl tracking-[0.5em] font-mono py-6 rounded-xl font-bold uppercase placeholder:tracking-normal placeholder:text-2xl placeholder:font-sans placeholder:opacity-30 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setRoomId("");
                        webRTC.current?.close();
                        signaling.current?.leaveRoom();
                      }}
                      className="flex-1 py-4 rounded-xl text-lg font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={startReceive}
                      disabled={roomId.length < 6 || status === "connecting"}
                      className={`flex-[2] py-4 rounded-xl text-lg font-bold shadow-xl transition-all duration-300 ${
                        roomId.length < 6
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/30 hover:-translate-y-1"
                      }`}>
                      {status === "connecting" ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />{" "}
                          Connecting...
                        </span>
                      ) : (
                        "Connect & Download"
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 animate-scale-in">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                    <Check className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    Transfer Complete!
                  </h3>
                  <p className="text-slate-500 mb-8">
                    {receivedFile.meta.name}
                  </p>
                  <button
                    onClick={downloadFile}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-lg py-4 rounded-xl font-bold shadow-xl shadow-slate-900/10 dark:shadow-white/5">
                    <Download className="w-5 h-5" />
                    <span>Save to Device</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar Overlay */}
          {(status === "sending" ||
            (status === "connected" &&
              mode === "receive" &&
              !receivedFile)) && (
            <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
                <span className="flex items-center gap-2">
                  {status === "sending" ? (
                    <Upload className="w-4 h-4 text-brand-500" />
                  ) : (
                    <Download className="w-4 h-4 text-blue-500" />
                  )}
                  {status === "sending" ? "Sending..." : "Receiving..."}
                </span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${status === "sending" ? "bg-gradient-to-r from-brand-500 to-indigo-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}
                  style={{ width: `${progress}%` }}>
                  <div className="w-full h-full opacity-30 bg-size-[1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">
                Do not close this window
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Force rebuild
export default P2PShare;
