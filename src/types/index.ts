export type CallType = 'voice' | 'video';
export type CallStatus = 'calling' | 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed';
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'audio';

export interface UserProfile {
  userId: string;
  displayName: string;
  username: string; // e.g. "alex_r"
  bio: string;
  profilePicture: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  privacySettings: {
    lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
    onlineStatusVisibility: 'everyone' | 'same_as_last_seen';
    readReceipts: boolean;
    whoCanContactMe: 'everyone' | 'contacts';
  };
  blockedUsers: string[]; // List of user IDs
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: string;
  editedAt?: string;
  status: DeliveryStatus;
  readBy: string[];
  deletedFor: string[];
}

export interface Conversation {
  chatId: string;
  participantId: string;
  unreadCount: number;
  updatedAt: string;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
    type: MessageType;
    status: DeliveryStatus;
  };
}

export interface CallHistoryItem {
  id: string;
  participantId: string;
  direction: 'incoming' | 'outgoing' | 'missed';
  callType: CallType;
  timestamp: string;
  durationSeconds: number;
}

export interface ActiveCallSession {
  callId: string;
  callerId: string;
  receiverId: string;
  callType: CallType;
  status: CallStatus;
  startedAt?: number;
  durationSeconds: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
}
