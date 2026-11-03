import React, { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Phone,
  RefreshCw,
  User
} from 'lucide-react';
import { ActiveCallSession, UserProfile } from '../types';
import { formatCallDuration } from '../utils/connectaLogic';
import { realtimeStore } from '../services/realtimeStore';

interface CallModalProps {
  call: ActiveCallSession;
  currentUser: UserProfile;
  onAccept: () => void;
  onDecline: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  call,
  currentUser,
  onAccept,
  onDecline,
  onEndCall,
  onToggleMute,
  onToggleCamera,
  onToggleSpeaker
}) => {
  const isIncoming = (call.status === 'calling' || call.status === 'ringing') && call.receiverId === currentUser.userId;
  const isOutgoing = call.status === 'calling' && call.callerId === currentUser.userId;
  const isConnected = call.status === 'accepted';

  const otherUserId = call.callerId === currentUser.userId ? call.receiverId : call.callerId;
  const otherUser = realtimeStore.getProfile(otherUserId);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Bind local media stream to video element
  useEffect(() => {
    const stream = realtimeStore.getLocalStream();
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [call.status, call.isCameraOff]);

  return (
    <div className="absolute inset-0 bg-[#0B0F19] text-white z-50 flex flex-col justify-between overflow-hidden select-none">
      {/* ================= INCOMING CALL SCREEN ================= */}
      {isIncoming && (
        <div className="flex-1 flex flex-col justify-between p-8 text-center bg-gradient-to-b from-indigo-950 via-[#0B0F19] to-[#0B0F19]">
          <div className="pt-10">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
              Incoming {call.callType === 'video' ? 'Video' : 'Voice'} Call
            </span>

            <div className="relative mx-auto w-32 h-32 mb-6">
              <div className="absolute -inset-4 bg-indigo-500/30 rounded-full blur-xl animate-pulse" />
              <img
                src={otherUser?.profilePicture || '/src/assets/images/user_avatar_alex_1793738752217.jpg'}
                alt={otherUser?.displayName}
                referrerPolicy="no-referrer"
                className="relative w-full h-full rounded-full object-cover border-4 border-indigo-400 shadow-2xl"
              />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
              {otherUser?.displayName || 'CONNECTA User'}
            </h2>
            <p className="text-xs text-indigo-300 font-mono">@{otherUser?.username}</p>
          </div>

          {/* Action buttons: Accept & Decline */}
          <div className="flex items-center justify-center gap-12 pb-6">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onDecline}
                aria-label="Decline incoming call"
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform cursor-pointer"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs font-medium text-slate-300">Decline</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onAccept}
                aria-label="Accept incoming call"
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform cursor-pointer"
              >
                {call.callType === 'video' ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
              </button>
              <span className="text-xs font-medium text-slate-300">Accept</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= OUTGOING CALL SCREEN ================= */}
      {isOutgoing && (
        <div className="flex-1 flex flex-col justify-between p-8 text-center bg-gradient-to-b from-indigo-950 via-[#0B0F19] to-[#0B0F19]">
          <div className="pt-10">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
              Calling ({call.callType === 'video' ? 'Video' : 'Voice'})...
            </span>

            <div className="relative mx-auto w-32 h-32 mb-6">
              <div className="absolute -inset-3 bg-indigo-500/20 rounded-full animate-ping" />
              <img
                src={otherUser?.profilePicture || '/src/assets/images/user_avatar_alex_1793738752217.jpg'}
                alt={otherUser?.displayName}
                referrerPolicy="no-referrer"
                className="relative w-full h-full rounded-full object-cover border-4 border-indigo-400 shadow-2xl"
              />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
              {otherUser?.displayName || 'CONNECTA User'}
            </h2>
            <p className="text-xs text-indigo-300 font-mono">@{otherUser?.username}</p>
          </div>

          <div className="flex flex-col items-center gap-2 pb-6">
            <button
              onClick={onEndCall}
              aria-label="End call"
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform cursor-pointer"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <span className="text-xs font-medium text-slate-300">End Call</span>
          </div>
        </div>
      )}

      {/* ================= ACTIVE CONNECTED CALL SCREEN ================= */}
      {isConnected && (
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
          {/* VIDEO CALL BACKGROUND */}
          {call.callType === 'video' ? (
            <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
              {/* Simulated remote participant view */}
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950/80 to-slate-950">
                <img
                  src={otherUser?.profilePicture || '/src/assets/images/user_avatar_maya_1793738766445.jpg'}
                  alt="Remote Participant"
                  referrerPolicy="no-referrer"
                  className="w-36 h-36 rounded-full object-cover border-4 border-indigo-500/40 shadow-2xl mb-4"
                />
                <h3 className="text-lg font-bold text-white">{otherUser?.displayName}</h3>
                <span className="text-xs text-indigo-300 font-mono">HD Peer Stream Connected</span>
              </div>

              {/* Floating Local Camera Preview (Picture-in-Picture) */}
              <div className="absolute top-14 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black z-20">
                {call.isCameraOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center">
                    <VideoOff className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">Camera Off</span>
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          ) : (
            /* VOICE CALL INTERFACE */
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-950 via-[#0B0F19] to-[#0B0F19] text-center">
              <div className="relative w-36 h-36 mb-6">
                <div className="absolute -inset-4 bg-indigo-500/20 rounded-full animate-pulse" />
                <img
                  src={otherUser?.profilePicture || '/src/assets/images/user_avatar_alex_1793738752217.jpg'}
                  alt={otherUser?.displayName}
                  referrerPolicy="no-referrer"
                  className="relative w-full h-full rounded-full object-cover border-4 border-indigo-400 shadow-2xl"
                />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                {otherUser?.displayName}
              </h2>
              <span className="text-xs text-indigo-300 font-mono">@{otherUser?.username}</span>

              {/* Live WebRTC Audio Waveform */}
              <div className="flex items-center gap-1.5 h-8 my-6">
                {[30, 60, 90, 45, 100, 70, 85, 40, 95, 50, 80].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-indigo-400 animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 90}ms`
                    }}
                  />
                ))}
              </div>

              <div className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-mono tracking-wider tabular-nums">
                {formatCallDuration(call.durationSeconds)}
              </div>
            </div>
          )}

          {/* Top Bar for Video Call: Duration & participant name */}
          {call.callType === 'video' && (
            <div className="relative z-20 px-6 pt-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pb-4">
              <div>
                <h3 className="font-semibold text-sm text-white">{otherUser?.displayName}</h3>
                <span className="text-xs font-mono text-indigo-300 tabular-nums">
                  {formatCallDuration(call.durationSeconds)}
                </span>
              </div>
            </div>
          )}

          {/* Bottom Call Controls Bar */}
          <div className="relative z-20 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex items-center justify-around">
            {/* Microphone Mute */}
            <button
              onClick={onToggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${
                call.isMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {call.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Camera Toggle (if video call) */}
            {call.callType === 'video' && (
              <button
                onClick={onToggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  call.isCameraOff
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {call.isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            )}

            {/* Speaker Toggle */}
            <button
              onClick={onToggleSpeaker}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors ${
                !call.isSpeakerOn
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {call.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition-transform cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
