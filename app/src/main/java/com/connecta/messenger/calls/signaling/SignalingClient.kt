package com.connecta.messenger.calls.signaling

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import org.webrtc.IceCandidate
import org.webrtc.SessionDescription

/**
 * Firestore-backed WebRTC signaling client for one-to-one voice & video calling.
 */
class SignalingClient(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private var callListener: ListenerRegistration? = null
    private var candidateListener: ListenerRegistration? = null

    fun sendOffer(callId: String, sdp: SessionDescription) {
        val offerMap = mapOf(
            "type" to sdp.type.canonicalForm(),
            "sdp" to sdp.description
        )
        firestore.collection("callSessions").document(callId)
            .update("offer", offerMap, "status", "calling")
    }

    fun sendAnswer(callId: String, sdp: SessionDescription) {
        val answerMap = mapOf(
            "type" to sdp.type.canonicalForm(),
            "sdp" to sdp.description
        )
        firestore.collection("callSessions").document(callId)
            .update("answer", answerMap, "status", "accepted")
    }

    fun sendIceCandidate(callId: String, senderId: String, candidate: IceCandidate) {
        val candidateMap = mapOf(
            "senderId" to senderId,
            "sdp" to candidate.sdp,
            "sdpMid" to candidate.sdpMid,
            "sdpMLineIndex" to candidate.sdpMLineIndex,
            "createdAt" to com.google.firebase.Timestamp.now()
        )
        firestore.collection("callSessions").document(callId)
            .collection("candidates")
            .add(candidateMap)
    }

    fun observeCallSession(callId: String): Flow<Map<String, Any>?> = callbackFlow {
        val registration = firestore.collection("callSessions").document(callId)
            .addSnapshotListener { snapshot, _ ->
                if (snapshot != null && snapshot.exists()) {
                    trySend(snapshot.data)
                }
            }
        awaitClose { registration.remove() }
    }

    fun observeRemoteCandidates(callId: String, currentUserId: String): Flow<IceCandidate> = callbackFlow {
        val registration = firestore.collection("callSessions").document(callId)
            .collection("candidates")
            .whereNotEqualTo("senderId", currentUserId)
            .addSnapshotListener { snapshots, _ ->
                snapshots?.documentChanges?.forEach { change ->
                    val data = change.document.data
                    val sdp = data["sdp"] as? String ?: return@forEach
                    val sdpMid = data["sdpMid"] as? String ?: ""
                    val sdpMLineIndex = (data["sdpMLineIndex"] as? Long)?.toInt() ?: 0
                    trySend(IceCandidate(sdpMid, sdpMLineIndex, sdp))
                }
            }
        awaitClose { registration.remove() }
    }

    fun endCall(callId: String, durationSeconds: Int) {
        firestore.collection("callSessions").document(callId)
            .update(
                "status", "ended",
                "endedAt", com.google.firebase.Timestamp.now(),
                "duration", durationSeconds
            )
    }

    fun cleanup() {
        callListener?.remove()
        candidateListener?.remove()
    }
}
