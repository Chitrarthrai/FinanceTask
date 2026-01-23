import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase";

type SignalCallback = (type: string, payload: any, senderId: string) => void;

export class SignalingClient {
  private channel: RealtimeChannel | null = null;
  private roomId: string | null = null;
  private onSignalCallback: SignalCallback | null = null;
  private myId: string;

  constructor() {
    this.myId = Math.random().toString(36).substring(7); // Simple random ID
  }

  joinRoom(roomId: string, onSignal: SignalCallback): Promise<void> {
    if (this.channel) {
      this.leaveRoom();
    }

    this.roomId = roomId;
    this.onSignalCallback = onSignal;

    console.log(`Joining P2P room: ${roomId} as ${this.myId}`);

    return new Promise((resolve, reject) => {
      this.channel = supabase
        .channel(`p2p:${roomId}`)
        .on("broadcast", { event: "signal" }, ({ payload }) => {
          // Ignore my own signals
          if (payload.senderId !== this.myId) {
            console.log(
              `Received signal ${payload.type} from ${payload.senderId}`,
            );
            this.onSignalCallback?.(
              payload.type,
              payload.data,
              payload.senderId,
            );
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(`Successfully subscribed to room ${roomId}`);
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error(`Failed to subscribe to room ${roomId}: ${status}`);
            reject(new Error(`Subscription failed: ${status}`));
          }
        });
    });
  }

  async sendSignal(type: string, data: any) {
    if (!this.channel || !this.roomId) {
      console.warn("Cannot send signal, not in a room");
      return;
    }

    console.log(`Sending signal ${type}`);

    try {
      await this.channel.send({
        type: "broadcast",
        event: "signal",
        payload: {
          type,
          data,
          senderId: this.myId,
        },
      });
      console.log(`Signal ${type} sent successfully`);
    } catch (e) {
      console.error(`Failed to send signal ${type}`, e);
    }
  }

  leaveRoom() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.roomId = null;
    }
  }

  getMyId() {
    return this.myId;
  }
}
