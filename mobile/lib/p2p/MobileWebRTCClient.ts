import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCDataChannel,
} from "react-native-webrtc";
import * as FileSystem from "expo-file-system/legacy";
import { encode, decode } from "base64-arraybuffer";
import { SignalingClient } from "./Signaling";
import { Platform } from "react-native";
import * as Sharing from "expo-sharing";

const CHUNK_SIZE = 16 * 1024; // 16KB

type ProgressCallback = (percent: number) => void;
type FileReceivedCallback = (fileUri: string, metadata: any) => void;
type StatusCallback = (status: string) => void;

interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

export class MobileWebRTCClient {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private signaling: SignalingClient;
  private isInitiator: boolean = false;

  // File assembly state
  private receivedSize: number = 0;
  private incomingFileMeta: FileMetadata | null = null;
  private receivedChunks: string[] = []; // Store Base64 chunks

  // Callbacks
  public onProgress: ProgressCallback | null = null;
  public onFileReceived: FileReceivedCallback | null = null;
  public onStatus: StatusCallback | null = null;

  constructor(signaling: SignalingClient) {
    this.signaling = signaling;

    const config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    };

    this.peerConnection = new RTCPeerConnection(config);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.sendSignal("candidate", event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      this.onStatus?.(state);
      console.log(`Connection state: ${state}`);
    };

    // Handle incoming data channels (for receiver)
    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };
  }

  async initialize(isInitiator: boolean) {
    this.isInitiator = isInitiator;

    if (this.isInitiator) {
      // Create data channel if we are the sender
      const channel = this.peerConnection.createDataChannel("file-transfer");
      this.setupDataChannel(channel);

      console.log("Creating offer...");
      const offer = await this.peerConnection.createOffer();
      console.log(
        `Created offer. Type: ${offer.type}, SDP Size: ${offer.sdp?.length} chars`,
      );

      await this.peerConnection.setLocalDescription(offer);
      console.log("Locally set description. Sending offer signal...");
      await this.signaling.sendSignal("offer", offer);
    }
  }

  handleSignal(type: string, data: any) {
    switch (type) {
      case "offer":
        this.handleOffer(data);
        break;
      case "answer":
        this.handleAnswer(data);
        break;
      case "candidate":
        this.handleCandidate(data);
        break;
    }
  }

  private async handleOffer(offer: any) {
    if (this.isInitiator) return;

    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.signaling.sendSignal("answer", answer);
  }

  private async handleAnswer(answer: any) {
    if (!this.isInitiator) return;
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  }

  private async handleCandidate(candidate: any) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error("Error adding received ice candidate", e);
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
    this.dataChannel.binaryType = "arraybuffer";

    this.dataChannel.onopen = () => {
      this.onStatus?.("connected");
      console.log("Data channel is open");
    };

    this.dataChannel.onmessage = async (event) => {
      const data = event.data;

      if (typeof data === "string") {
        try {
          const msg = JSON.parse(data);
          if (msg.type === "metadata") {
            this.incomingFileMeta = msg.payload;
            this.receivedSize = 0;
            this.receivedChunks = [];
            console.log("Incoming file metadata:", this.incomingFileMeta);
          }
        } catch (e) {
          console.error("Failed to parse message", e);
        }
      } else {
        // Handle binary chunk (ArrayBuffer)
        if (!this.incomingFileMeta) return;

        try {
          // Convert ArrayBuffer to Base64 and store
          const base64Chunk = encode(data as ArrayBuffer);
          this.receivedChunks.push(base64Chunk);

          this.receivedSize += data.byteLength;

          const progress =
            (this.receivedSize / this.incomingFileMeta.size) * 100;
          this.onProgress?.(progress);

          if (this.receivedSize >= this.incomingFileMeta.size) {
            const tempFileUri =
              FileSystem.cacheDirectory + this.incomingFileMeta!.name;

            // Keep UI logical by joining and writing
            console.log("File reception complete, writing to disk...");
            const fullBase64 = this.receivedChunks.join("");

            await FileSystem.writeAsStringAsync(tempFileUri, fullBase64, {
              encoding: "base64",
            });

            this.onFileReceived?.(tempFileUri, this.incomingFileMeta);
            // Reset state
            this.incomingFileMeta = null;
            this.receivedChunks = [];
          }
        } catch (error) {
          console.error("Error processing chunk or writing file:", error);
        }
      }
    };
  }

  async sendFile(
    fileUri: string,
    meta: { name: string; size: number; type: string },
  ) {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      console.error("Data channel not ready");
      return;
    }

    // Send metadata
    const metadata = {
      type: "metadata",
      payload: meta,
    };
    this.dataChannel.send(JSON.stringify(metadata));

    // Send chunks
    let offset = 0;

    const readAndSendChunk = async () => {
      if (offset >= meta.size) return;

      const length = Math.min(CHUNK_SIZE, meta.size - offset);
      try {
        // Read chunk as Base64
        const base64Chunk = await FileSystem.readAsStringAsync(fileUri, {
          encoding: "base64",
          position: offset,
          length: length,
        });

        // Convert to ArrayBuffer
        const buffer = decode(base64Chunk);

        // Send
        this.dataChannel?.send(buffer);

        offset += length;
        const progress = (offset / meta.size) * 100;
        this.onProgress?.(progress);

        // Schedule next chunk (not recursion to avoid stack overflow on large files)
        setTimeout(readAndSendChunk, 0);
      } catch (error) {
        console.error("Error sending chunk:", error);
      }
    };

    readAndSendChunk();
  }

  close() {
    this.dataChannel?.close();
    this.peerConnection.close();
  }
}
