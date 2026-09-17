import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, PhoneCall, User } from "lucide-react";
import { ChatThread } from "./types";

interface VoiceCallModalProps {
  isOpen: boolean;
  thread: ChatThread | null;
  onClose: () => void;
}

export function VoiceCallModal({ isOpen, thread, onClose }: VoiceCallModalProps) {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [status, setStatus] = useState<"connecting" | "connected">("connecting");

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      setStatus("connecting");
      return;
    }

    const connectTimeout = setTimeout(() => {
      setStatus("connected");
    }, 1800);

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimeout);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen || !thread) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 12 }}
          className="relative w-full max-w-sm bg-card border border-border/90 rounded-[36px] p-8 shadow-2xl z-10 flex flex-col items-center text-center overflow-hidden"
        >
          {/* Pulsing ring around avatar */}
          <div className="relative my-4">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="absolute inset-0 -m-3 rounded-full bg-blue-500/20"
            />
            <motion.div
              animate={{ scale: [1, 1.45, 1], opacity: [0.15, 0.4, 0.15] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
              className="absolute inset-0 -m-6 rounded-full bg-blue-500/15"
            />
            {thread.avatar ? (
              <img
                src={thread.avatar}
                alt={thread.name}
                className="w-24 h-24 rounded-full object-cover relative z-10 border-4 border-card shadow-lg"
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-full ${
                  thread.avatarBg || "bg-blue-600"
                } text-white grid place-items-center text-2xl font-bold relative z-10 border-4 border-card shadow-lg`}
              >
                {thread.name.charAt(0)}
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-foreground mt-2">{thread.name}</h3>
          <p className="text-xs font-semibold text-blue-500 mt-1 flex items-center gap-1.5">
            {status === "connecting" ? (
              <>
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span>Calling...</span>
              </>
            ) : (
              <span>In Call • {formatTimer(seconds)}</span>
            )}
          </p>

          {/* Waveform indicator */}
          {status === "connected" && (
            <div className="flex items-center gap-1 h-6 my-4">
              {[8, 16, 24, 12, 20, 28, 14, 22, 10, 18, 14].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [4, h, 6] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                  className="w-1 bg-blue-500 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full grid place-items-center transition-all cursor-pointer shadow-sm ${
                isMuted ? "bg-destructive text-white" : "bg-muted hover:bg-accent text-foreground"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-14 h-14 rounded-full bg-destructive text-white grid place-items-center hover:bg-destructive/90 transition-all cursor-pointer shadow-lg active:scale-95"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-12 h-12 rounded-full grid place-items-center transition-all cursor-pointer shadow-sm ${
                isSpeakerOn ? "bg-accent text-foreground" : "bg-muted text-muted-foreground"
              }`}
              title={isSpeakerOn ? "Speaker Off" : "Speaker On"}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
