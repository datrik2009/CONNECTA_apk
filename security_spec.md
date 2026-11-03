# CONNECTA Firebase Security Specification

## 1. Data Invariants
1. **Identity & Ownership**: A user document at `/users/{userId}` can only be created or modified by an authenticated user whose UID matches `{userId}`.
2. **Username Uniqueness**: Username reservation at `/usernames/{username}` maps a lowercase username directly to the owner's UID. Updates are blocked; deletion is restricted to the owning UID.
3. **Chat Membership**: A conversation `/chats/{chatId}` and its subcollection `/messages/{messageId}` can only be accessed or modified by members listed in the parent `chat.members` array.
4. **Message Integrity**: A message's `senderId` must strictly equal the authenticated caller's UID. Only the sender can edit content; the receiver can only update read receipts (`readBy`).
5. **Call Session Isolation**: WebRTC signaling records `/callSessions/{callId}` and candidate exchanges are strictly limited to the `callerId` and `receiverId`.
6. **Safety & Abuse Reports**: Reports in `/reports/{reportId}` are write-only for authenticated callers (reporterId == auth.uid) and cannot be read or tampered with by clients.

## 2. The "Dirty Dozen" Threat Payloads
1. **User Profile Impersonation**: Attempting to create `/users/victim_123` with `auth.uid = attacker_456`. (Rejected: isOwner mismatch)
2. **Username Squatting / Hijacking**: Attempting to overwrite an existing username record `/usernames/alex_r`. (Rejected: allow update: if false)
3. **Chat Snooping**: Attempting to read `/chats/{chatId}` where `auth.uid` is not present in `members`. (Rejected: isChatMember failure)
4. **Message Spoofing**: Submitting a message to `/chats/{chatId}/messages/{msgId}` with `senderId: "victim_123"` while authenticated as `"attacker_456"`. (Rejected: senderId must match auth.uid)
5. **Unauthorized Message Deletion**: Attempting to delete another participant's message. (Rejected: existing().senderId == request.auth.uid)
6. **Malicious Oversized Message Payload**: Sending a text message exceeding 4000 characters. (Rejected: size <= 4000 check)
7. **Eavesdropping on Call Signaling**: Querying `/callSessions` for sessions where `auth.uid` is neither caller nor receiver. (Rejected: resource.data participant check)
8. **Tampering with Call Caller ID**: Updating a call session to forge caller identity. (Rejected: callerId and receiverId immutability)
9. **Malicious Document ID Injection**: Using arbitrary characters or oversized path keys (e.g. `../../admin` or 1KB string). (Rejected: isValidId check)
10. **Report Tampering / Scraping**: Attempting to list or read records in `/reports`. (Rejected: allow read: if false)
11. **Bypassing Read Receipt Boundary**: Attempting to modify message text under the guise of marking as read. (Rejected: affectedKeys().hasOnly(['readBy', 'deletedFor']))
12. **Self-Granting Admin Privileges**: Attempting to inject `isAdmin: true` into the user profile. (Rejected: strict key and type schema validation in isValidUser)
