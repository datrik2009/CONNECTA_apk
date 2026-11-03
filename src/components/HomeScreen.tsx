import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Settings as SettingsIcon,
  Search,
  Plus,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Check,
  CheckCheck,
  Trash2,
  Shield,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Conversation, CallHistoryItem, UserProfile } from '../types';
import { formatTimestamp, formatCallDuration } from '../utils/connectaLogic';
import { realtimeStore } from '../services/realtimeStore';

interface HomeScreenProps {
  currentUser: UserProfile;
  conversations: Conversation[];
  callHistory: CallHistoryItem[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenChat: (participantId: string) => void;
  onOpenNewChatModal: () => void;
  onStartVoiceCall: (participantId: string) => void;
  onStartVideoCall: (participantId: string) => void;
  onOpenPrivacySettings: () => void;
  onOpenProfileEdit: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onLogout: () => void;
  onSwitchDeviceUser: (userId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  conversations,
  callHistory,
  theme,
  onToggleTheme,
  onOpenChat,
  onOpenNewChatModal,
  onStartVoiceCall,
  onStartVideoCall,
  onOpenPrivacySettings,
  onOpenProfileEdit,
  onOpenTerms,
  onOpenPrivacy,
  onLogout,
  onSwitchDeviceUser
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'calls' | 'settings'>('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredConversations = conversations.filter((c) => {
    const contact = realtimeStore.getProfile(c.participantId);
    if (!contact) return false;
    const q = searchQuery.toLowerCase();
    return (
      contact.displayName.toLowerCase().includes(q) ||
      contact.username.toLowerCase().includes(q) ||
      c.lastMessage?.text.toLowerCase().includes(q)
    );
  });

  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 select-none overflow-hidden">
      {/* Top App Bar */}
      <header className="px-5 pt-3 pb-3 shrink-0 flex flex-col gap-2 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/connecta_logo_mark_1793738738164.jpg"
              alt="Logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-xl object-cover shadow-sm border border-indigo-500/30"
            />
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              CONNECTA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Search chats"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenProfileEdit}
              aria-label="Open profile settings"
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-500/40 focus:outline-none hover:scale-105 transition-transform"
            >
              <img
                src={currentUser.profilePicture}
                alt={currentUser.displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {showSearch && (
          <div className="relative mt-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats by name, @username or message..."
              autoFocus
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pb-20">
            {filteredConversations.length === 0 ? (
              <div className="py-20 px-6 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {searchQuery ? 'No matching chats found' : 'No conversations yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  {searchQuery
                    ? 'Try searching by a different name or username.'
                    : 'Tap the + button below to start a private chat with any CONNECTA user.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const contact = realtimeStore.getProfile(conv.participantId);
                if (!contact) return null;
                const isSentByMe = conv.lastMessage?.senderId === currentUser.userId;

                return (
                  <div
                    key={conv.chatId}
                    onClick={() => onOpenChat(conv.participantId)}
                    className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-100/60 dark:hover:bg-slate-900/40 cursor-pointer active:bg-slate-200/50 dark:active:bg-slate-800/60 transition-colors"
                  >
                    {/* Avatar with Presence Indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={contact.profilePicture}
                        alt={contact.displayName}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-800"
                      />
                      {contact.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B0F19]" />
                      )}
                    </div>

                    {/* Middle: Name & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                          {contact.displayName}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                          {formatTimestamp(conv.updatedAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                          {isSentByMe && (
                            <span className="shrink-0 text-slate-400">
                              {conv.lastMessage?.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                              ) : conv.lastMessage?.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </span>
                          )}
                          <span className="truncate">{conv.lastMessage?.text || 'Draft'}</span>
                        </div>

                        {conv.unreadCount > 0 && (
                          <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* CALLS TAB */}
        {activeTab === 'calls' && (
          <div className="p-4 pb-20 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recent Calls
              </h2>
              {callHistory.length > 0 && (
                <button
                  onClick={() => realtimeStore.clearCallHistory()}
                  className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {callHistory.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <Phone className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No call records
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your WebRTC voice and video calls will appear here.
                </p>
              </div>
            ) : (
              callHistory.map((call) => {
                const contact = realtimeStore.getProfile(call.participantId);
                if (!contact) return null;
                const isMissed = call.direction === 'missed';
                const isIncoming = call.direction === 'incoming';

                return (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={contact.profilePicture}
                        alt={contact.displayName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            isMissed ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {contact.displayName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {isMissed ? (
                            <PhoneMissed className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          ) : isIncoming ? (
                            <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <PhoneOutgoing className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          )}
                          <span className="capitalize">{call.direction}</span>
                          <span>·</span>
                          <span className="tabular-nums">
                            {call.durationSeconds > 0
                              ? formatCallDuration(call.durationSeconds)
                              : formatTimestamp(call.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onStartVoiceCall(call.participantId)}
                        aria-label="Start voice call"
                        className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartVideoCall(call.participantId)}
                        aria-label="Start video call"
                        className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center transition-colors"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="p-4 pb-20 space-y-4">
            {/* User Profile Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.displayName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold truncate text-white">{currentUser.displayName}</h3>
                  <p className="text-xs text-indigo-300 font-mono">@{currentUser.username}</p>
                  <p className="text-xs text-slate-300/80 truncate mt-1">{currentUser.bio}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-800/50 flex justify-between items-center text-xs">
                <button
                  onClick={onOpenProfileEdit}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-medium transition-colors"
                >
                  Edit Profile
                </button>
                <span className="text-[11px] text-indigo-300 font-mono">E2E Secure</span>
              </div>
            </div>

            {/* Switch Active User / Demo Account */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Simulate Device Account
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSwitchDeviceUser('user_alex')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
                    currentUser.userId === 'user_alex'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Alex Rivera</span>
                </button>
                <button
                  onClick={() => onSwitchDeviceUser('user_maya')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
                    currentUser.userId === 'user_maya'
                      ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 text-violet-600 dark:text-violet-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span>Maya Chen</span>
                </button>
              </div>
            </div>

            {/* Settings Options Group */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
              <button
                onClick={onOpenPrivacySettings}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block text-slate-900 dark:text-slate-100">
                      Privacy & Blocked Users
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Last seen, read receipts, who can call
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <div className="px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block text-slate-900 dark:text-slate-100">
                      Appearance Theme
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize">{theme} Mode Active</span>
                  </div>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              <button
                onClick={onOpenTerms}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Terms & Privacy Policy
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onLogout}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/30 text-left text-red-600 dark:text-red-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-100/50 dark:bg-red-950/50 text-red-500 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Sign Out</span>
                </div>
              </button>
            </div>

            {/* Version & Attribution */}
            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-400 font-medium">
                CONNECTA v1.0.0 (Native Android & WebRTC)
              </p>
              <p className="text-[10px] text-slate-500">
                Encrypted Real-Time Communication
              </p>
            </div>
          </div>
        )}

        {/* Floating Action Button (New Chat) */}
        {activeTab === 'chats' && (
          <button
            onClick={onOpenNewChatModal}
            aria-label="Start new chat"
            className="absolute bottom-20 right-5 w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 z-30 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </main>

      {/* Modern Bottom Navigation Bar */}
      <nav className="h-16 px-4 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-200/70 dark:border-slate-800/70 grid grid-cols-3 items-center z-20 shrink-0">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'chats'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                {totalUnreadCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold mt-1">Chats</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'calls'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Phone className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-1">Calls</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'settings'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-1">Settings</span>
        </button>
      </nav>
    </div>
  );
};
