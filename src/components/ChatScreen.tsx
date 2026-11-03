import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Mic,
  Square,
  Check,
  CheckCheck,
  X,
  Play,
  Pause,
  Copy,
  Edit2,
  Trash2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { formatTimestamp } from '../utils/connectaLogic';
import { realtimeStore } from '../services/realtimeStore';

interface ChatScreenProps {
  participantId: string;
  currentUser: UserProfile;
  messages: ChatMessage[];
  onBack: () => void;
  onStartVoiceCall: () => void;
  onStartVideoCall: () => void;
  onViewProfile: (userId: string) => void;
}

const COMMON_EMOJIS = ['👋', '❤️', '👍', '🔥', '😂', '✨', '🙏', '🎉', '🚀', '☕'];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  participantId,
  currentUser,
  messages,
  onBack,
  onStartVoiceCall,
  onStartVideoCall,
  onViewProfile
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceTimerRef = useRef<number | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Message action menu (long press / right-click)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Lightbox view for image
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const contact = realtimeStore.getProfile(participantId);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read on mount or when new messages arrive
  useEffect(() => {
    const chatId = realtimeStore.getChatId(currentUser.userId, participantId);
    realtimeStore.markChatAsRead(chatId);
  }, [messages, currentUser.userId, participantId]);

  // Handle voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceSeconds(0);
      voiceTimerRef.current = window.setInterval(() => {
        setVoiceSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedPhotoPreview) return;

    if (selectedPhotoPreview) {
      realtimeStore.sendMessage(participantId, {
        type: 'image',
        imageUrl: selectedPhotoPreview,
        text: inputText.trim() || undefined
      });
      setSelectedPhotoPreview(null);
    } else {
      realtimeStore.sendMessage(participantId, {
        type: 'text',
        text: inputText.trim()
      });
    }

    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSendVoiceNote = () => {
    const duration = voiceSeconds || 3;
    setIsRecordingVoice(false);
    realtimeStore.sendMessage(participantId, {
      type: 'audio',
      audioUrl: 'synthetic-audio-note',
      audioDuration: duration
    });
  };

  const handleCancelVoiceNote = () => {
    setIsRecordingVoice(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editText.trim()) {
      realtimeStore.editMessage(editingMessageId, editText.trim());
      setEditingMessageId(null);
      setEditText('');
      setSelectedMessage(null);
    }
  };

  const isBlocked = currentUser.blockedUsers.includes(participantId);

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 select-none overflow-hidden relative">
      {/* Chat Header */}
      <header className="px-4 py-2.5 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            aria-label="Back to conversations"
            className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={() => onViewProfile(participantId)}
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
          >
            <div className="relative shrink-0">
              <img
                src={contact?.profilePicture || '/src/assets/images/user_avatar_alex_1793738752217.jpg'}
                alt={contact?.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-800"
              />
              {contact?.isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-[#0B0F19]" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate leading-tight">
                {contact?.displayName || 'Contact'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {contact?.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons: Voice Call, Video Call, Three-dot Menu */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onStartVoiceCall}
            disabled={isBlocked}
            aria-label="Start voice call"
            className="w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors disabled:opacity-40"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={onStartVideoCall}
            disabled={isBlocked}
            aria-label="Start video call"
            className="w-8 h-8 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors disabled:opacity-40"
          >
            <Video className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More options"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Overflow Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-10 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30 text-xs">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onViewProfile(participantId);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (isBlocked) {
                      realtimeStore.unblockUser(participantId);
                    } else {
                      realtimeStore.blockUser(participantId);
                    }
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    realtimeStore.reportUser(participantId, 'Inappropriate behavior');
                    alert('Report received. Thank you for keeping CONNECTA safe.');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-red-600 dark:text-red-400"
                >
                  Report User
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Blocked banner if applicable */}
      {isBlocked && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 text-center flex items-center justify-center gap-1.5 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>You have blocked this contact. Unblock to message or call.</span>
        </div>
      )}

      {/* Message Stream */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
              <Smile className="w-6 h-6" />
            </div>
            <p className="text-xs font-medium">Say hello to {contact?.displayName}!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Messages and calls are end-to-end encrypted.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.userId;

            return (
              <div
                key={msg.messageId}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedMessage(msg);
                }}
              >
                <div
                  onClick={() => setSelectedMessage(msg)}
                  className={`relative max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm transition-all cursor-pointer ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800/60 rounded-bl-xs'
                  }`}
                >
                  {/* Photo Attachment if present */}
                  {msg.imageUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden cursor-pointer">
                      <img
                        src={msg.imageUrl}
                        alt="attachment"
                        referrerPolicy="no-referrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(msg.imageUrl || null);
                        }}
                        className="w-full max-h-56 object-cover rounded-xl hover:opacity-95 transition-opacity"
                      />
                    </div>
                  )}

                  {/* Voice Note if audio */}
                  {msg.type === 'audio' && (
                    <div className="flex items-center gap-3 py-1 min-w-44">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingAudioId(playingAudioId === msg.messageId ? null : msg.messageId);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 ${
                          isMe ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {playingAudioId === msg.messageId ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>

                      {/* Animated audio waveform visualization */}
                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {[40, 75, 20, 90, 60, 30, 85, 50, 95, 30, 70, 45].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-200 ${
                              playingAudioId === msg.messageId ? 'animate-pulse' : ''
                            } ${isMe ? 'bg-white/70' : 'bg-indigo-500'}`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>

                      <span className="text-[11px] font-mono shrink-0 opacity-80 tabular-nums">
                        00:{String(msg.audioDuration || 3).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {/* Text content */}
                  {msg.text && (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {msg.text}
                    </p>
                  )}

                  {/* Metadata: Timestamp & Status checks */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                      isMe ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.editedAt && <span className="italic mr-0.5">(edited)</span>}
                    <span className="tabular-nums">{formatTimestamp(msg.timestamp)}</span>
                    {isMe && (
                      <span className="ml-0.5">
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-indigo-200" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Image Preview before Sending */}
      {selectedPhotoPreview && (
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-t border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={selectedPhotoPreview}
              alt="Preview"
              className="w-12 h-12 object-cover rounded-xl border border-indigo-300"
            />
            <div>
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 block">
                Photo ready to send
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                Add an optional message or send now
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedPhotoPreview(null)}
            className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Inline Emoji Selector Tray */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setInputText((prev) => prev + emoji)}
              className="text-xl p-1.5 hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Composition Input Bar */}
      <footer className="p-3 bg-white dark:bg-[#0B0F19] border-t border-slate-200/70 dark:border-slate-800/70 shrink-0 z-20">
        {isRecordingVoice ? (
          /* Voice Recording Mode */
          <div className="flex items-center justify-between gap-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl p-2 px-4 border border-indigo-200 dark:border-indigo-900">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-red-500 tabular-nums">
                00:{String(voiceSeconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                Recording audio note...
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelVoiceNote}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendVoiceNote}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Text Composition */
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Toggle emoji picker"
              className="w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center shrink-0 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            <label className="w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center shrink-0 transition-colors cursor-pointer">
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isBlocked ? 'You cannot message this user' : 'Type a message...'}
              disabled={isBlocked}
              className="flex-1 h-11 px-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />

            {inputText.trim() || selectedPhotoPreview ? (
              <button
                type="submit"
                disabled={isBlocked}
                aria-label="Send message"
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                disabled={isBlocked}
                aria-label="Record voice message"
                className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
        )}
      </footer>

      {/* Message Action Context Modal (Copy, Edit, Delete for me) */}
      {selectedMessage && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-end justify-center z-40 p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 space-y-2 border border-slate-200 dark:border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            {/* Copy */}
            {selectedMessage.text && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMessage.text || '');
                  setSelectedMessage(null);
                }}
                className="w-full px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-medium"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Message Text</span>
              </button>
            )}

            {/* Edit (only if I'm sender) */}
            {selectedMessage.senderId === currentUser.userId && selectedMessage.type === 'text' && (
              <button
                onClick={() => {
                  setEditingMessageId(selectedMessage.messageId);
                  setEditText(selectedMessage.text || '');
                  setSelectedMessage(null);
                }}
                className="w-full px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-medium"
              >
                <Edit2 className="w-4 h-4 text-indigo-500" />
                <span>Edit Message</span>
              </button>
            )}

            {/* Delete for Me */}
            <button
              onClick={() => {
                realtimeStore.deleteMessageForMe(selectedMessage.messageId);
                setSelectedMessage(null);
              }}
              className="w-full px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-medium text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete for Me</span>
            </button>

            {/* Report */}
            {selectedMessage.senderId !== currentUser.userId && (
              <button
                onClick={() => {
                  realtimeStore.reportUser(participantId, `Reported message: ${selectedMessage.text}`);
                  setSelectedMessage(null);
                  alert('Message reported. Our safety team will review it.');
                }}
                className="w-full px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-medium text-amber-600"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Inappropriate Content</span>
              </button>
            )}

            <button
              onClick={() => setSelectedMessage(null)}
              className="w-full py-2.5 text-xs text-slate-500 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Message Modal */}
      {editingMessageId && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-sm font-bold mb-3">Edit Message</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full h-24 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingMessageId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Image */}
      {lightboxImage && (
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};
