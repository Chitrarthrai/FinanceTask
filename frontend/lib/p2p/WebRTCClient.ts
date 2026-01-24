import { SignalingClient } from "./Signaling";

const CHUNK_SIZE = 16 * 1024; // 16KB - Safe MTU
const MAX_BUFFERED_AMOUNT = 64 * 1024; // 64KB - Low Latency

type ProgressCallback = (percent: number) => void;
type FileReceivedCallback = (file: Blob, metadata: any) => void;
type StatusCallback = (status: string) => void;

interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

export class WebRTCClient {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private signaling: SignalingClient;
  private isInitiator: boolean = false;

  // File assembly state
  private receivedChunks: ArrayBuffer[] = [];
  private receivedSize: number = 0;
  private incomingFileMeta: FileMetadata | null = null;

  // Callbacks
  public onProgress: ProgressCallback | null = null;
  public onFileReceived: FileReceivedCallback | null = null;
  public onStatus: StatusCallback | null = null;

  constructor(signaling: SignalingClient) {
    this.signaling = signaling;

    const config: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
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

    this.peerConnection.oniceconnectionstatechange = () => {
      const iceState = this.peerConnection.iceConnectionState;
      console.log(`ICE Connection State: ${iceState}`);
      if (iceState === "failed" || iceState === "disconnected") {
        console.warn(
          "ICE connection failed. Possible network firewall/NAT issue.",
        );
      }
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
      await this.peerConnection.setLocalDescription(offer);
      await this.signaling.sendSignal("offer", offer);
    }
  }

  handleSignal(type: string, data: any) {
    console.log(`[WebRTC] Received signal: ${type}`, data);
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

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    console.log("[WebRTC] Handling offer...");
    if (this.isInitiator) {
      console.warn("[WebRTC] Received offer but I am initiator, ignoring.");
      return;
    }

    try {
      console.log("[WebRTC] Setting remote description...");
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
      console.log("[WebRTC] Creating answer...");
      const answer = await this.peerConnection.createAnswer();
      console.log("[WebRTC] Setting local description...");
      await this.peerConnection.setLocalDescription(answer);
      console.log("[WebRTC] Sending answer...");
      await this.signaling.sendSignal("answer", answer);
    } catch (e) {
      console.error("[WebRTC] Error handling offer:", e);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.isInitiator) return; // Should not happen
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  }

  private async handleCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error("Error adding received ice candidate", e);
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
    this.dataChannel.binaryType = "arraybuffer";
    // Refill when buffer is half empty to keep pipe saturated
    this.dataChannel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT / 2;

    this.dataChannel.onopen = () => {
      this.onStatus?.("connected");
      console.log("Data channel is open");
    };

    this.dataChannel.onmessage = (event) => {
      const data = event.data;

      if (typeof data === "string") {
        // Handle metadata
        try {
          const msg = JSON.parse(data);
          if (msg.type === "metadata") {
            this.incomingFileMeta = msg.payload;
            this.receivedChunks = [];
            this.receivedSize = 0;
            console.log("Incoming file:", this.incomingFileMeta);
          }
        } catch (e) {
          console.error("Failed to parse message", e);
        }
      } else {
        // Handle binary chunk
        if (!this.incomingFileMeta) return;

        this.receivedChunks.push(data);
        this.receivedSize += data.byteLength;

        // Progress
        const progress = (this.receivedSize / this.incomingFileMeta.size) * 100;
        this.onProgress?.(progress);

        // Check if complete
        if (this.receivedSize >= this.incomingFileMeta.size) {
          const blob = new Blob(this.receivedChunks, {
            type: this.incomingFileMeta.type,
          });
          this.onFileReceived?.(blob, this.incomingFileMeta);
          this.receivedChunks = [];
          this.incomingFileMeta = null;
        }
      }
    };
  }

  /**
   * Send file using "Breathing Loop" architecture.
   * Uses async imperative loop + explicit yielding to prevent CPU starvation and ICE timeouts.
   */
  async sendFile(file: File) {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      console.error("Data channel not ready");
      return;
    }

    // 1. Send Metadata
    const metadata = {
      type: "metadata",
      payload: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    };
    this.dataChannel.send(JSON.stringify(metadata));
    console.log(`Starting file send: ${file.name}, size: ${file.size}`);

    // Wait for connection to settle (500ms safety)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 2. Prepare Loop
    const reader = new FileReader();
    let offset = 0;
    let chunkCount = 0;

    const readPromise = (blob: Blob): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(blob);
      });
    };

    // 3. Start Chunk Loop
    try {
      while (offset < file.size) {
        // Check Backpressure
        if (this.dataChannel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
          await new Promise<void>((resolve) => {
            if (!this.dataChannel) return resolve();
            const handler = () => {
              this.dataChannel?.removeEventListener(
                "bufferedamountlow",
                handler,
              );
              resolve();
            };
            this.dataChannel.addEventListener("bufferedamountlow", handler);
          });
        }

        // Read Chunk
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const buffer = await readPromise(slice);

        // Send
        this.dataChannel.send(buffer);
        offset += buffer.byteLength;
        chunkCount++;

        // Update Progress
        const progress = (offset / file.size) * 100;
        this.onProgress?.(progress);

        // Log occasionally
        if (chunkCount % 200 === 0) {
          console.log(
            `Sent ${(offset / (1024 * 1024)).toFixed(2)} MB / ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          );
          // EXPLICIT YIELD: Breath for 0ms to let ICE pings process
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      console.log("File send complete");
    } catch (err) {
      console.error("Error sending file:", err);
    }
  }

  close() {
    this.dataChannel?.close();
    this.peerConnection.close();
  }
}
