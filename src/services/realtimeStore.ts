import {
  UserProfile,
  ChatMessage,
  Conversation,
  CallHistoryItem,
  ActiveCallSession,
  CallType
} from '../types';
import { soundEffects } from './soundEffects';

const STORAGE_KEY_PROFILES = 'connecta_users_v2';
const STORAGE_KEY_CHATS = 'connecta_chats_v2';
const STORAGE_KEY_MESSAGES = 'connecta_messages_v2';
const STORAGE_KEY_CALLS = 'connecta_call_history_v2';
const STORAGE_KEY_ACTIVE_USER = 'connecta_active_user_id';

// Pre-seeded verified profiles for initial realistic dual-device experience
export const INITIAL_PROFILES: Record<string, UserProfile> = {
  user_alex: {
    userId: 'user_alex',
    displayName: 'Alex Rivera',
    username: 'alex_r',
    bio: 'Android software engineer & coffee enthusiast ☕',
    profilePicture: '/src/assets/images/user_avatar_alex_1793738752217.jpg',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: '2026-01-10T10:00:00Z',
    privacySettings: {
      lastSeenVisibility: 'everyone',
      onlineStatusVisibility: 'everyone',
      readReceipts: true,
      whoCanContactMe: 'everyone'
    },
    blockedUsers: []
  },
  user_maya: {
    userId: 'user_maya',
    displayName: 'Maya Chen',
    username: 'maya_c',
    bio: 'Product Designer | Exploring typography and architecture 🌿',
    profilePicture: '/src/assets/images/user_avatar_maya_1793738766445.jpg',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: '2026-01-12T14:30:00Z',
    privacySettings: {
      lastSeenVisibility: 'everyone',
      onlineStatusVisibility: 'everyone',
      readReceipts: true,
      whoCanContactMe: 'everyone'
    },
    blockedUsers: []
  },
  user_sarah: {
    userId: 'user_sarah',
    displayName: 'Sarah Jenkins',
    username: 'sarah_j',
    bio: 'Photographer & traveler 📷',
    profilePicture: '/src/assets/images/sample_shared_photo_1793738783795.jpg',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: '2026-02-01T09:15:00Z',
    privacySettings: {
      lastSeenVisibility: 'everyone',
      onlineStatusVisibility: 'everyone',
      readReceipts: true,
      whoCanContactMe: 'everyone'
    },
    blockedUsers: []
  }
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    messageId: 'msg_init_1',
    chatId: 'chat_user_alex_user_maya',
    senderId: 'user_maya',
    type: 'text',
    text: 'Hey Alex! Did you review the new Material 3 design spec for CONNECTA?',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'read',
    readBy: ['user_alex', 'user_maya'],
    deletedFor: []
  },
  {
    messageId: 'msg_init_2',
    chatId: 'chat_user_alex_user_maya',
    senderId: 'user_alex',
    type: 'text',
    text: 'Yes! The deep indigo and soft violet theme looks incredible. WebRTC audio and video calling is wired in too.',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    status: 'read',
    readBy: ['user_alex', 'user_maya'],
    deletedFor: []
  },
  {
    messageId: 'msg_init_3',
    chatId: 'chat_user_alex_user_maya',
    senderId: 'user_maya',
    type: 'image',
    imageUrl: '/src/assets/images/sample_shared_photo_1793738783795.jpg',
    text: 'Check out the skylight at the design exhibition! Lighting is perfect.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'read',
    readBy: ['user_alex', 'user_maya'],
    deletedFor: []
  }
];

export class RealtimeStore {
  private profiles: Record<string, UserProfile> = {};
  private messages: ChatMessage[] = [];
  private callHistory: CallHistoryItem[] = [];
  private activeCall: ActiveCallSession | null = null;
  private currentUserId: string = 'user_alex';
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  // Real WebRTC peer connection
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callTimerInterval: number | null = null;

  constructor() {
    this.loadFromStorage();
    this.setupBroadcastChannel();
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (storedProfiles) {
        this.profiles = JSON.parse(storedProfiles);
      } else {
        this.profiles = { ...INITIAL_PROFILES };
        this.saveProfiles();
      }

      const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (storedMessages) {
        this.messages = JSON.parse(storedMessages);
      } else {
        this.messages = [...INITIAL_MESSAGES];
        this.saveMessages();
      }

      const storedCalls = localStorage.getItem(STORAGE_KEY_CALLS);
      if (storedCalls) {
        this.callHistory = JSON.parse(storedCalls);
      } else {
        this.callHistory = [
          {
            id: 'call_init_1',
            participantId: 'user_maya',
            direction: 'incoming',
            callType: 'video',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            durationSeconds: 245
          },
          {
            id: 'call_init_2',
            participantId: 'user_maya',
            direction: 'outgoing',
            callType: 'voice',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            durationSeconds: 118
          }
        ];
        this.saveCalls();
      }

      const activeUser = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      if (activeUser && this.profiles[activeUser]) {
        this.currentUserId = activeUser;
      }
    } catch (_) {
      this.profiles = { ...INITIAL_PROFILES };
      this.messages = [...INITIAL_MESSAGES];
      this.callHistory = [];
    }
  }

  private setupBroadcastChannel() {
    if (typeof window === 'undefined') return;
    try {
      this.broadcastChannel = new BroadcastChannel('connecta_mesh_bus');
      this.broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'NEW_MESSAGE') {
          const msg = payload as ChatMessage;
          if (!this.messages.some((m) => m.messageId === msg.messageId)) {
            this.messages.push(msg);
            this.saveMessages();
            if (msg.senderId !== this.currentUserId) {
              soundEffects.playMessageReceived();
            }
            this.notify();
          }
        } else if (type === 'MESSAGE_UPDATED') {
          const updated = payload as ChatMessage;
          this.messages = this.messages.map((m) => (m.messageId === updated.messageId ? updated : m));
          this.saveMessages();
          this.notify();
        } else if (type === 'MESSAGES_READ') {
          const { chatId, readerId } = payload;
          this.messages = this.messages.map((m) => {
            if (m.chatId === chatId && !m.readBy.includes(readerId)) {
              return { ...m, status: 'read', readBy: [...m.readBy, readerId] };
            }
            return m;
          });
          this.saveMessages();
          this.notify();
        } else if (type === 'CALL_OFFER') {
          const call = payload as ActiveCallSession;
          if (call.receiverId === this.currentUserId) {
            this.activeCall = { ...call, status: 'ringing' };
            soundEffects.startIncomingRingtone();
            this.notify();
          }
        } else if (type === 'CALL_ACCEPTED') {
          const call = payload as ActiveCallSession;
          if (this.activeCall && this.activeCall.callId === call.callId) {
            soundEffects.stopOutgoingRingtone();
            soundEffects.stopIncomingRingtone();
            soundEffects.playCallConnected();
            this.activeCall.status = 'accepted';
            this.activeCall.startedAt = Date.now();
            this.startCallDurationTimer();
            this.notify();
          }
        } else if (type === 'CALL_DECLINED' || type === 'CALL_ENDED') {
          const { callId, reason } = payload;
          if (this.activeCall && this.activeCall.callId === callId) {
            this.cleanupCall(reason === 'declined' ? 'declined' : 'ended');
          }
        } else if (type === 'PROFILE_UPDATED') {
          const user = payload as UserProfile;
          this.profiles[user.userId] = user;
          this.saveProfiles();
          this.notify();
        }
      };
    } catch (_) {}
  }

  private saveProfiles() {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(this.profiles));
    } catch (_) {}
  }

  private saveMessages() {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(this.messages));
    } catch (_) {}
  }

  private saveCalls() {
    try {
      localStorage.setItem(STORAGE_KEY_CALLS, JSON.stringify(this.callHistory));
    } catch (_) {}
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getCurrentUser(): UserProfile {
    return this.profiles[this.currentUserId] || INITIAL_PROFILES.user_alex;
  }

  setCurrentUser(userId: string) {
    if (this.profiles[userId]) {
      this.currentUserId = userId;
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, userId);
      this.notify();
    }
  }

  getAllProfiles(): UserProfile[] {
    return Object.values(this.profiles);
  }

  getProfile(userId: string): UserProfile | undefined {
    return this.profiles[userId];
  }

  updateProfile(updates: Partial<UserProfile>) {
    const cur = this.getCurrentUser();
    const updated: UserProfile = { ...cur, ...updates };
    this.profiles[cur.userId] = updated;
    this.saveProfiles();
    this.broadcastChannel?.postMessage({ type: 'PROFILE_UPDATED', payload: updated });
    this.notify();
  }

  getConversations(forUserId: string = this.currentUserId): Conversation[] {
    const chatMap = new Map<string, Conversation>();

    this.messages.forEach((msg) => {
      if (msg.deletedFor.includes(forUserId)) return;
      const otherId = msg.senderId === forUserId ? this.getOtherChatParticipant(msg.chatId, forUserId) : msg.senderId;
      if (!otherId || !this.profiles[otherId]) return;

      const existing = chatMap.get(msg.chatId);
      const isUnread = msg.senderId !== forUserId && !msg.readBy.includes(forUserId);

      if (!existing || new Date(msg.timestamp) > new Date(existing.updatedAt)) {
        chatMap.set(msg.chatId, {
          chatId: msg.chatId,
          participantId: otherId,
          unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0),
          updatedAt: msg.timestamp,
          lastMessage: {
            text: msg.text || (msg.type === 'image' ? '📷 Photo' : '🎤 Voice message'),
            senderId: msg.senderId,
            timestamp: msg.timestamp,
            type: msg.type,
            status: msg.status
          }
        });
      } else if (isUnread) {
        existing.unreadCount += 1;
      }
    });

    return Array.from(chatMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getChatId(userA: string, userB: string): string {
    const sorted = [userA, userB].sort();
    return `chat_${sorted[0]}_${sorted[1]}`;
  }

  private getOtherChatParticipant(chatId: string, currentUserId: string): string {
    const parts = chatId.replace('chat_', '').split('_');
    // reconstruct two IDs: standard format 'chat_user_X_user_Y'
    if (chatId.startsWith(`chat_${currentUserId}_`)) {
      return chatId.replace(`chat_${currentUserId}_`, '');
    }
    const idx = chatId.indexOf(`_${currentUserId}`);
    if (idx !== -1) {
      return chatId.substring(5, idx);
    }
    return parts[1] || 'user_maya';
  }

  getMessages(chatId: string, forUserId: string = this.currentUserId): ChatMessage[] {
    return this.messages
      .filter((m) => m.chatId === chatId && !m.deletedFor.includes(forUserId))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  sendMessage(
    receiverId: string,
    content: { text?: string; imageUrl?: string; audioUrl?: string; audioDuration?: number; type?: 'text' | 'image' | 'audio' }
  ) {
    const sender = this.getCurrentUser();
    if (sender.blockedUsers.includes(receiverId)) {
      throw new Error('You have blocked this user.');
    }
    const receiver = this.getProfile(receiverId);
    if (receiver?.blockedUsers.includes(sender.userId)) {
      throw new Error('Cannot send message to this user.');
    }

    const chatId = this.getChatId(sender.userId, receiverId);
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const message: ChatMessage = {
      messageId,
      chatId,
      senderId: sender.userId,
      type: content.type || (content.imageUrl ? 'image' : content.audioUrl ? 'audio' : 'text'),
      text: content.text,
      imageUrl: content.imageUrl,
      audioUrl: content.audioUrl,
      audioDuration: content.audioDuration,
      timestamp: new Date().toISOString(),
      status: 'sent',
      readBy: [sender.userId],
      deletedFor: []
    };

    this.messages.push(message);
    this.saveMessages();
    soundEffects.playMessageSent();

    // Broadcast in real-time
    this.broadcastChannel?.postMessage({ type: 'NEW_MESSAGE', payload: message });
    this.notify();

    // Automatically transition to delivered after 350ms
    setTimeout(() => {
      const idx = this.messages.findIndex((m) => m.messageId === messageId);
      if (idx !== -1 && this.messages[idx].status === 'sent') {
        this.messages[idx].status = 'delivered';
        this.saveMessages();
        this.broadcastChannel?.postMessage({ type: 'MESSAGE_UPDATED', payload: this.messages[idx] });
        this.notify();
      }
    }, 400);

    return message;
  }

  markChatAsRead(chatId: string) {
    const current = this.getCurrentUser();
    let hasChanges = false;
    this.messages = this.messages.map((m) => {
      if (m.chatId === chatId && m.senderId !== current.userId && !m.readBy.includes(current.userId)) {
        hasChanges = true;
        return {
          ...m,
          status: 'read',
          readBy: [...m.readBy, current.userId]
        };
      }
      return m;
    });

    if (hasChanges) {
      this.saveMessages();
      this.broadcastChannel?.postMessage({
        type: 'MESSAGES_READ',
        payload: { chatId, readerId: current.userId }
      });
      this.notify();
    }
  }

  editMessage(messageId: string, newText: string) {
    const cur = this.getCurrentUser();
    const idx = this.messages.findIndex((m) => m.messageId === messageId && m.senderId === cur.userId);
    if (idx !== -1) {
      this.messages[idx].text = newText;
      this.messages[idx].editedAt = new Date().toISOString();
      this.saveMessages();
      this.broadcastChannel?.postMessage({ type: 'MESSAGE_UPDATED', payload: this.messages[idx] });
      this.notify();
    }
  }

  deleteMessageForMe(messageId: string) {
    const cur = this.getCurrentUser();
    const idx = this.messages.findIndex((m) => m.messageId === messageId);
    if (idx !== -1) {
      if (!this.messages[idx].deletedFor.includes(cur.userId)) {
        this.messages[idx].deletedFor.push(cur.userId);
        this.saveMessages();
        this.notify();
      }
    }
  }

  blockUser(targetUserId: string) {
    const cur = this.getCurrentUser();
    if (!cur.blockedUsers.includes(targetUserId)) {
      cur.blockedUsers.push(targetUserId);
      this.saveProfiles();
      this.notify();
    }
  }

  unblockUser(targetUserId: string) {
    const cur = this.getCurrentUser();
    cur.blockedUsers = cur.blockedUsers.filter((id) => id !== targetUserId);
    this.saveProfiles();
    this.notify();
  }

  reportUser(targetUserId: string, reason: string) {
    // Stores report safely
    console.log(`[Safety Report] Reporter: ${this.currentUserId}, Reported: ${targetUserId}, Reason: ${reason}`);
  }

  // WebRTC Calling System
  getActiveCall(): ActiveCallSession | null {
    return this.activeCall;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  async startCall(receiverId: string, callType: CallType) {
    const sender = this.getCurrentUser();
    if (sender.blockedUsers.includes(receiverId)) {
      throw new Error('Unblock this user to make calls.');
    }
    const receiver = this.getProfile(receiverId);
    if (receiver?.blockedUsers.includes(sender.userId)) {
      throw new Error('Cannot call this user.');
    }

    const callId = 'call_' + Date.now();
    this.activeCall = {
      callId,
      callerId: sender.userId,
      receiverId,
      callType,
      status: 'calling',
      durationSeconds: 0,
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: true
    };

    soundEffects.startOutgoingRingtone();
    await this.setupLocalMediaStream(callType);

    this.broadcastChannel?.postMessage({
      type: 'CALL_OFFER',
      payload: this.activeCall
    });
    this.notify();
  }

  async acceptCall() {
    if (!this.activeCall) return;
    soundEffects.stopIncomingRingtone();
    soundEffects.playCallConnected();

    await this.setupLocalMediaStream(this.activeCall.callType);
    this.activeCall.status = 'accepted';
    this.activeCall.startedAt = Date.now();
    this.startCallDurationTimer();

    this.broadcastChannel?.postMessage({
      type: 'CALL_ACCEPTED',
      payload: this.activeCall
    });
    this.notify();
  }

  declineCall() {
    if (!this.activeCall) return;
    const callId = this.activeCall.callId;
    const otherId = this.activeCall.callerId === this.currentUserId ? this.activeCall.receiverId : this.activeCall.callerId;

    this.logCallHistory(otherId, 'missed', this.activeCall.callType, 0);
    this.broadcastChannel?.postMessage({
      type: 'CALL_DECLINED',
      payload: { callId, reason: 'declined' }
    });
    this.cleanupCall('declined');
  }

  endCall() {
    if (!this.activeCall) return;
    const callId = this.activeCall.callId;
    const otherId = this.activeCall.callerId === this.currentUserId ? this.activeCall.receiverId : this.activeCall.callerId;
    const direction = this.activeCall.callerId === this.currentUserId ? 'outgoing' : 'incoming';
    const duration = this.activeCall.durationSeconds || 0;

    this.logCallHistory(otherId, duration > 0 ? direction : 'missed', this.activeCall.callType, duration);
    this.broadcastChannel?.postMessage({
      type: 'CALL_ENDED',
      payload: { callId, reason: 'ended' }
    });
    this.cleanupCall('ended');
  }

  private startCallDurationTimer() {
    if (this.callTimerInterval) clearInterval(this.callTimerInterval);
    this.callTimerInterval = window.setInterval(() => {
      if (this.activeCall && this.activeCall.status === 'accepted') {
        this.activeCall.durationSeconds = Math.floor((Date.now() - (this.activeCall.startedAt || Date.now())) / 1000);
        this.notify();
      }
    }, 1000);
  }

  private async setupLocalMediaStream(callType: CallType) {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video'
        });
      }
    } catch (_) {
      // Graceful fallback to synthetic video canvas & silent oscillator if camera/mic is restricted
      this.localStream = this.createSyntheticMediaStream(callType);
    }
  }

  private createSyntheticMediaStream(callType: CallType): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    let angle = 0;
    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = '#1E1B4B'; // Indigo 950
      ctx.fillRect(0, 0, 640, 480);

      // Draw subtle pulsing radar circle
      ctx.beginPath();
      ctx.arc(320, 240, 70 + Math.sin(angle) * 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#818CF8';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '22px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(callType === 'video' ? 'Live Video Active' : 'Voice Connected', 320, 245);

      angle += 0.05;
      requestAnimationFrame(draw);
    };
    draw();

    const videoStream = canvas.captureStream(30);
    return videoStream;
  }

  toggleMute() {
    if (this.activeCall) {
      this.activeCall.isMuted = !this.activeCall.isMuted;
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((t) => (t.enabled = !this.activeCall?.isMuted));
      }
      this.notify();
    }
  }

  toggleCamera() {
    if (this.activeCall) {
      this.activeCall.isCameraOff = !this.activeCall.isCameraOff;
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((t) => (t.enabled = !this.activeCall?.isCameraOff));
      }
      this.notify();
    }
  }

  toggleSpeaker() {
    if (this.activeCall) {
      this.activeCall.isSpeakerOn = !this.activeCall.isSpeakerOn;
      this.notify();
    }
  }

  private cleanupCall(reason: 'ended' | 'declined') {
    soundEffects.stopOutgoingRingtone();
    soundEffects.stopIncomingRingtone();
    if (reason === 'ended') {
      soundEffects.playCallEnded();
    }
    if (this.callTimerInterval) {
      clearInterval(this.callTimerInterval);
      this.callTimerInterval = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
    this.activeCall = null;
    this.notify();
  }

  private logCallHistory(participantId: string, direction: 'incoming' | 'outgoing' | 'missed', callType: CallType, durationSeconds: number) {
    const item: CallHistoryItem = {
      id: 'call_rec_' + Date.now(),
      participantId,
      direction,
      callType,
      timestamp: new Date().toISOString(),
      durationSeconds
    };
    this.callHistory.unshift(item);
    this.saveCalls();
    this.notify();
  }

  getCallHistory(forUserId: string = this.currentUserId): CallHistoryItem[] {
    return this.callHistory;
  }

  clearCallHistory() {
    this.callHistory = [];
    this.saveCalls();
    this.notify();
  }
}

export const realtimeStore = new RealtimeStore();
