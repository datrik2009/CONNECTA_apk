import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUsername,
  formatCallDuration,
  transitionCallState,
  canInitiateContact
} from './connectaLogic';

test('validateUsername enforces length, character rules, and reserved names', () => {
  // Too short
  assert.equal(validateUsername('ab').isValid, false);
  // Too long
  assert.equal(validateUsername('a'.repeat(21)).isValid, false);
  // Invalid characters
  assert.equal(validateUsername('john-doe').isValid, false);
  assert.equal(validateUsername('john doe').isValid, false);
  assert.equal(validateUsername('alex@connecta').isValid, false);
  // Reserved name
  assert.equal(validateUsername('admin').isValid, false);
  assert.equal(validateUsername('support').isValid, false);

  // Valid usernames
  assert.equal(validateUsername('alex_r').isValid, true);
  assert.equal(validateUsername('maya_chen_99').isValid, true);
  assert.equal(validateUsername('sarah123').isValid, true);
});

test('formatCallDuration formats seconds into proper MM:SS or HH:MM:SS', () => {
  assert.equal(formatCallDuration(0), '00:00');
  assert.equal(formatCallDuration(5), '00:05');
  assert.equal(formatCallDuration(65), '01:05');
  assert.equal(formatCallDuration(599), '09:59');
  assert.equal(formatCallDuration(3661), '01:01:01');
  assert.equal(formatCallDuration(-10), '00:00');
});

test('transitionCallState transitions predictably across the call lifecycle', () => {
  // Dialing an outgoing call
  assert.equal(transitionCallState('IDLE', 'DIAL'), 'CALLING');
  // Caller gets answered
  assert.equal(transitionCallState('CALLING', 'ACCEPT'), 'CONNECTED');
  // User hangs up
  assert.equal(transitionCallState('CONNECTED', 'HANGUP'), 'ENDED');

  // Incoming call ringing then declined
  assert.equal(transitionCallState('IDLE', 'RING'), 'RINGING');
  assert.equal(transitionCallState('RINGING', 'DECLINE'), 'DECLINED');

  // Ringing timeout creates missed call
  assert.equal(transitionCallState('RINGING', 'TIMEOUT'), 'MISSED');
});

test('canInitiateContact handles self-call and blocked status properly', () => {
  // Self call
  const selfCheck = canInitiateContact('u1', 'u1', false, false);
  assert.equal(selfCheck.allowed, false);

  // Blocked by receiver
  const blockedCheck = canInitiateContact('u1', 'u2', true, false);
  assert.equal(blockedCheck.allowed, false);

  // Caller has blocked receiver
  const blockerCheck = canInitiateContact('u1', 'u2', false, true);
  assert.equal(blockerCheck.allowed, false);

  // Normal valid contact
  const validCheck = canInitiateContact('u1', 'u2', false, false);
  assert.equal(validCheck.allowed, true);
});
