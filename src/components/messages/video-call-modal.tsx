import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Share2, Users, Maximize2 } from "lucide-react";
import { ChatThread } from "./types";

interface VideoCallModalProps {
  isOpen: boolean;
  thread: ChatThread | null;
  onClose: () => void;
}

export function VideoCallModal({ isOpen, thread, onClose }: VideoCallModalProps) {
  const [seconds, setSeconds] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !thread) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl h-[85vh] bg-[#121316] text-white rounded-[32px] shadow-2xl z-10 flex flex-col overflow-hidden border border-white/10"
        >
          {/* Top Bar */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 grid place-items-center font-bold text-sm">
                {thread.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {thread.name}
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  Live • {formatTimer(seconds)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90">
                HD 1080p
              </span>
            </div>
          </div>

          {/* Video Feeds Grid */}
          <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden relative">
            {/* Primary remote tile */}
            <div className="relative rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center">
              {thread.avatar ? (
                <img
                  src={thread.avatar}
                  alt={thread.name}
                  className="w-full h-full object-cover filter brightness-95"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-blue-600/40 text-blue-300 grid place-items-center text-3xl font-bold border-2 border-blue-500/30">
                    {thread.name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-neutral-300">{thread.name}</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-xs font-medium text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{thread.name}</span>
              </div>
            </div>

            {/* Self video tile */}
            <div className="relative rounded-2xl bg-neutral-800 border border-white/10 overflow-hidden flex items-center justify-center">
              {isVideoOff ? (
                <div className="flex flex-col items-center gap-2 text-neutral-400">
                  <VideoOff className="w-10 h-10" />
                  <span className="text-xs font-medium">Your camera is off</span>
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  alt="You"
                  className="w-full h-full object-cover filter brightness-90"
                />
              )}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-xs font-medium text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>You (Presenter)</span>
              </div>
            </div>
          </div>

          {/* Floating Call Controls Toolbar */}
          <div className="p-4 sm:p-5 bg-black/60 border-t border-white/10 flex items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`w-12 h-12 rounded-2xl grid place-items-center transition-all cursor-pointer ${
                isMicMuted
                  ? "bg-destructive text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={isMicMuted ? "Unmute" : "Mute"}
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`w-12 h-12 rounded-2xl grid place-items-center transition-all cursor-pointer ${
                isVideoOff
                  ? "bg-destructive text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={isVideoOff ? "Turn video on" : "Turn video off"}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`w-12 h-12 rounded-2xl grid place-items-center transition-all cursor-pointer ${
                isScreenSharing
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title="Share screen"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 h-12 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ml-2"
              title="End Video Call"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="hidden sm:inline">End Call</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
