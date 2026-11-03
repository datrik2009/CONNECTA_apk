package com.connecta.messenger.data.models

import com.google.firebase.Timestamp

data class User(
    val userId: String = "",
    val displayName: String = "",
    val username: String = "",
    val usernameLowercase: String = "",
    val profilePicture: String? = null,
    val bio: String = "",
    val isOnline: Boolean = false,
    val lastSeen: Timestamp? = null,
    val createdAt: Timestamp? = null
)

data class Chat(
    val chatId: String = "",
    val members: List<String> = emptyList(),
    val createdAt: Timestamp? = null,
    val updatedAt: Timestamp? = null,
    val lastMessage: LastMessageSummary? = null
)

data class LastMessageSummary(
    val text: String = "",
    val senderId: String = "",
    val timestamp: Timestamp? = null,
    val type: String = "text"
)

enum class MessageType {
    TEXT, IMAGE, AUDIO
}

enum class DeliveryStatus {
    SENDING, SENT, DELIVERED, READ
}

data class Message(
    val messageId: String = "",
    val senderId: String = "",
    val text: String = "",
    val type: MessageType = MessageType.TEXT,
    val imageUrl: String? = null,
    val audioUrl: String? = null,
    val audioDuration: Int? = null,
    val createdAt: Timestamp? = null,
    val editedAt: Timestamp? = null,
    val readBy: List<String> = emptyList(),
    val deletedFor: List<String> = emptyList(),
    val status: DeliveryStatus = DeliveryStatus.SENT
)

enum class CallType {
    VOICE, VIDEO
}

enum class CallStatus {
    CALLING, RINGING, ACCEPTED, DECLINED, ENDED, MISSED
}

data class CallSession(
    val callId: String = "",
    val callerId: String = "",
    val receiverId: String = "",
    val callType: CallType = CallType.VOICE,
    val status: CallStatus = CallStatus.CALLING,
    val offer: Map<String, Any>? = null,
    val answer: Map<String, Any>? = null,
    val createdAt: Timestamp? = null,
    val endedAt: Timestamp? = null,
    val durationSeconds: Int = 0
)

data class IceCandidateModel(
    val candidateId: String = "",
    val senderId: String = "",
    val sdp: String = "",
    val sdpMid: String = "",
    val sdpMLineIndex: Int = 0,
    val createdAt: Timestamp? = null
)
