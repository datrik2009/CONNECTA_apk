/**
 * Pure domain logic for CONNECTA messenger.
 * Decoupled from UI to enable rigorous unit testing and predictable state machines.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'connecta',
  'support',
  'system',
  'official',
  'help'
]);

/**
 * Validates a prospective CONNECTA username.
 * Rules:
 * - 3 to 20 characters
 * - Only alphanumeric characters and underscores
 * - Not in reserved system usernames
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Username is required.' };
  }
  const clean = username.trim().toLowerCase();
  if (clean.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters.' };
  }
  if (clean.length > 20) {
    return { isValid: false, error: 'Username cannot exceed 20 characters.' };
  }
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!regex.test(clean)) {
    return { isValid: false, error: 'Only letters, numbers, and underscores are allowed.' };
  }
  if (RESERVED_USERNAMES.has(clean)) {
    return { isValid: false, error: 'This username is reserved.' };
  }
  return { isValid: true };
}

/**
 * Formats a duration in seconds to standard call timer format (MM:SS or HH:MM:SS)
 */
export function formatCallDuration(totalSeconds: number): string {
  if (totalSeconds < 0 || isNaN(totalSeconds)) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Formats timestamps for messages and chat list
 */
export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export type CallState = 'IDLE' | 'CALLING' | 'RINGING' | 'CONNECTED' | 'DECLINED' | 'ENDED' | 'MISSED';
export type CallEvent = 'DIAL' | 'RING' | 'ACCEPT' | 'DECLINE' | 'HANGUP' | 'TIMEOUT' | 'RESET';

/**
 * Pure state machine transition for WebRTC call lifecycles.
 */
export function transitionCallState(current: CallState, event: CallEvent): CallState {
  switch (current) {
    case 'IDLE':
      if (event === 'DIAL') return 'CALLING';
      if (event === 'RING') return 'RINGING';
      return current;
    case 'CALLING':
      if (event === 'RING') return 'RINGING';
      if (event === 'ACCEPT') return 'CONNECTED';
      if (event === 'DECLINE') return 'DECLINED';
      if (event === 'HANGUP') return 'ENDED';
      if (event === 'TIMEOUT') return 'MISSED';
      return current;
    case 'RINGING':
      if (event === 'ACCEPT') return 'CONNECTED';
      if (event === 'DECLINE') return 'DECLINED';
      if (event === 'HANGUP') return 'ENDED';
      if (event === 'TIMEOUT') return 'MISSED';
      return current;
    case 'CONNECTED':
      if (event === 'HANGUP') return 'ENDED';
      return current;
    case 'DECLINED':
    case 'ENDED':
    case 'MISSED':
      if (event === 'RESET' || event === 'DIAL') return 'IDLE';
      return current;
    default:
      return 'IDLE';
  }
}

/**
 * Evaluates whether User A is permitted to initiate a conversation/call with User B
 */
export function canInitiateContact(
  callerId: string,
  receiverId: string,
  callerBlockedByReceiver: boolean,
  receiverBlockedByCaller: boolean
): { allowed: boolean; reason?: string } {
  if (callerId === receiverId) {
    return { allowed: false, reason: 'You cannot initiate a contact session with yourself.' };
  }
  if (callerBlockedByReceiver) {
    return { allowed: false, reason: 'You cannot contact this user.' };
  }
  if (receiverBlockedByCaller) {
    return { allowed: false, reason: 'Unblock this user to communicate.' };
  }
  return { allowed: true };
}
