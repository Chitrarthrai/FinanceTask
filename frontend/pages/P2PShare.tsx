import React, { useState, useEffect, useRef } from 'react';
import { SignalingClient } from '../lib/p2p/Signaling';
import { WebRTCClient } from '../lib/p2p/WebRTCClient';
import {
  Share2,
  Download,
  Upload,
  File as FileIcon,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const generateRoomId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export const P2PShare: React.FC = () => {
  const [mode, setMode] = useState<'send' | 'receive'>('send');
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('idle');
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
    webRTC.current?.close();
    signaling.current?.leaveRoom();

    const sig = new SignalingClient();
    const rtc = new WebRTCClient(sig);

    rtc.onStatus = (s) => setStatus(s);
    rtc.onProgress = (p) => setProgress(p);
    rtc.onFileReceived = (blob, meta) => {
      setReceivedFile({ blob, meta });
      setStatus('completed');
    };

    signaling.current = sig;
    webRTC.current = rtc;
    return { sig, rtc };
  };

  const startSend = async () => {
    const { sig, rtc } = initializeP2P();
    await new Promise((r) => setTimeout(r, 100));

    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setStatus('waiting');

    await sig.joinRoom(newRoomId, async (type, payload) => {
      if (type === 'new-peer') {
        await rtc.initialize(true);
      } else {
        rtc.handleSignal(type, payload);
      }
    });
  };

  const startReceive = async () => {
    if (!roomId) return;
    const { sig, rtc } = initializeP2P();
    setStatus('connecting');

    await sig.joinRoom(roomId, (type, payload) => {
      rtc.handleSignal(type, payload);
    });

    await sig.sendSignal('new-peer', {});
    await rtc.initialize(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const sendFile = () => {
    if (file && status === 'connected' && webRTC.current) {
      setStatus('sending');
      webRTC.current.sendFile(file);
    }
  };

  const downloadFile = () => {
    if (!receivedFile) return;
    const url = URL.createObjectURL(receivedFile.blob);
    const a = document.createElement('a');
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
    <div className="w-full space-y-6 pb-20 animate-fade-in">
      {/* Header Banner */}
      <section className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[var(--accent-primary-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 mb-2">
          <Share2 className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold font-display text-[var(--text-primary)] tracking-tight">
          Toffee P2P Encrypted Transfer
        </h1>
        <p className="text-xs font-mono text-[var(--text-secondary)]">
          Direct peer-to-peer browser file delivery. Zero server storage, infinite speed.
        </p>
      </section>

      {/* Mode Toggle Pills */}
      <div className="flex justify-center">
        <div className="flex p-1 rounded-xl glass-panel">
          <button
            onClick={() => {
              setMode('send');
              setStatus('idle');
              setFile(null);
              setRoomId('');
            }}
            className={`px-6 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mode === 'send'
                ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Upload className="w-3.5 h-3.5 inline mr-1.5" />
            Send File
          </button>

          <button
            onClick={() => {
              setMode('receive');
              setStatus('idle');
              setReceivedFile(null);
              setRoomId('');
            }}
            className={`px-6 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              mode === 'receive'
                ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Download className="w-3.5 h-3.5 inline mr-1.5" />
            Receive File
          </button>
        </div>
      </div>

      {/* Main Card */}
      <Card variant="rim" className="max-w-md mx-auto p-6 space-y-6">
        {mode === 'send' && (
          <div className="space-y-6">
            {!roomId ? (
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-[var(--border-rim)] hover:border-[var(--accent-primary)] rounded-2xl p-8 text-center bg-[var(--surface-l2)]/40 transition-all cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary-light)] text-[var(--accent-primary)] flex items-center justify-center mx-auto mb-3">
                    <FileIcon className="w-7 h-7" />
                  </div>
                  {file ? (
                    <div>
                      <p className="font-bold text-sm text-[var(--text-primary)] truncate">{file.name}</p>
                      <p className="text-xs font-mono text-[var(--accent-primary)] mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-sm text-[var(--text-primary)]">Drop file or click to browse</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Any file format up to 2GB</p>
                    </div>
                  )}
                </div>

                {file && (
                  <Button variant="primary" className="w-full" onClick={startSend}>
                    Generate Secure Share Code
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Badge variant="cyan" size="sm">
                  Active Share Code
                </Badge>
                <div
                  onClick={copyRoomId}
                  className="p-4 rounded-xl glass-panel border border-[var(--accent-primary)]/50 cursor-pointer hover:bg-[var(--surface-l2)] transition-all"
                >
                  <div className="text-4xl font-mono font-bold tracking-[0.25em] text-[var(--text-primary)]">
                    {roomId}
                  </div>
                  <span className="text-[11px] font-mono text-[var(--accent-primary)] mt-1 block">
                    {copied ? 'Copied to Clipboard!' : 'Click to Copy Code'}
                  </span>
                </div>
              </div>
            )}

            {status === 'connected' && (
              <div className="p-4 rounded-xl bg-[var(--success)]/15 border border-[var(--success)]/30 text-center space-y-3">
                <Badge variant="success" size="sm">
                  Peer Connected
                </Badge>
                <Button variant="primary" className="w-full" onClick={sendFile}>
                  Start Transfer
                </Button>
              </div>
            )}
          </div>
        )}

        {mode === 'receive' && (
          <div className="space-y-6">
            {!receivedFile ? (
              <div className="space-y-4">
                <Input
                  label="Enter 6-Digit Share Code"
                  placeholder="XXXXXX"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center font-mono text-xl tracking-[0.3em] font-bold"
                />

                <Button
                  variant="primary"
                  className="w-full"
                  disabled={roomId.length < 6 || status === 'connecting'}
                  onClick={startReceive}
                >
                  {status === 'connecting' ? 'Connecting...' : 'Connect & Receive'}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Badge variant="success" size="sm">
                  Transfer Complete
                </Badge>
                <p className="font-bold text-sm text-[var(--text-primary)]">{receivedFile.meta.name}</p>
                <Button variant="primary" className="w-full" onClick={downloadFile} leftIcon={<Download className="w-4 h-4" />}>
                  Save File
                </Button>
              </div>
            )}
          </div>
        )}

        {(status === 'sending' || (status === 'connected' && mode === 'receive' && !receivedFile)) && (
          <div className="pt-4 border-t border-[var(--border-rim)] space-y-2">
            <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)]">
              <span>{status === 'sending' ? 'Sending...' : 'Receiving...'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-[var(--surface-l2)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent-primary)] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default P2PShare;
