import React, { useState } from 'react';
import { AndroidFrame } from './AndroidFrame';
import { HomeScreen } from './HomeScreen';
import { ChatScreen } from './ChatScreen';
import { CallModal } from './CallModal';
import { NewChatModal } from './NewChatModal';
import { PrivacySettingsModal } from './PrivacySettingsModal';
import { ProfileEditModal } from './ProfileEditModal';
import { TermsAndPrivacyModal } from './TermsAndPrivacyModal';
import { UserProfile, Conversation, CallHistoryItem } from '../types';
import { realtimeStore } from '../services/realtimeStore';

interface DualDeviceProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const DualDeviceView: React.FC<DualDeviceProps> = ({
  theme,
  onToggleTheme
}) => {
  // Device 1 (Alex Rivera)
  const [device1ActiveChat, setDevice1ActiveChat] = useState<string | null>('user_maya');
  const [device1NewChatOpen, setDevice1NewChatOpen] = useState(false);
  const [device1PrivacyOpen, setDevice1PrivacyOpen] = useState(false);
  const [device1ProfileEditOpen, setDevice1ProfileEditOpen] = useState(false);
  const [device1TermsModal, setDevice1TermsModal] = useState<'terms' | 'privacy' | null>(null);

  // Device 2 (Maya Chen)
  const [device2ActiveChat, setDevice2ActiveChat] = useState<string | null>('user_alex');
  const [device2NewChatOpen, setDevice2NewChatOpen] = useState(false);
  const [device2PrivacyOpen, setDevice2PrivacyOpen] = useState(false);
  const [device2ProfileEditOpen, setDevice2ProfileEditOpen] = useState(false);
  const [device2TermsModal, setDevice2TermsModal] = useState<'terms' | 'privacy' | null>(null);

  const alex = realtimeStore.getProfile('user_alex') || realtimeStore.getCurrentUser();
  const maya = realtimeStore.getProfile('user_maya') || realtimeStore.getCurrentUser();

  const alexConversations = realtimeStore.getConversations('user_alex');
  const mayaConversations = realtimeStore.getConversations('user_maya');

  const alexCalls = realtimeStore.getCallHistory('user_alex');
  const mayaCalls = realtimeStore.getCallHistory('user_maya');

  const activeCall = realtimeStore.getActiveCall();

  const alexChatMessages = device1ActiveChat
    ? realtimeStore.getMessages(realtimeStore.getChatId('user_alex', device1ActiveChat), 'user_alex')
    : [];

  const mayaChatMessages = device2ActiveChat
    ? realtimeStore.getMessages(realtimeStore.getChatId('user_maya', device2ActiveChat), 'user_maya')
    : [];

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-8 py-4">
      {/* DEVICE 1: Alex Rivera */}
      <AndroidFrame theme={theme} deviceLabel="Device 1 · Alex Rivera (@alex_r)">
        {device1ActiveChat ? (
          <ChatScreen
            participantId={device1ActiveChat}
            currentUser={alex}
            messages={alexChatMessages}
            onBack={() => setDevice1ActiveChat(null)}
            onStartVoiceCall={() => realtimeStore.startCall(device1ActiveChat, 'voice')}
            onStartVideoCall={() => realtimeStore.startCall(device1ActiveChat, 'video')}
            onViewProfile={() => {}}
          />
        ) : (
          <HomeScreen
            currentUser={alex}
            conversations={alexConversations}
            callHistory={alexCalls}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onOpenChat={(id) => setDevice1ActiveChat(id)}
            onOpenNewChatModal={() => setDevice1NewChatOpen(true)}
            onStartVoiceCall={(id) => realtimeStore.startCall(id, 'voice')}
            onStartVideoCall={(id) => realtimeStore.startCall(id, 'video')}
            onOpenPrivacySettings={() => setDevice1PrivacyOpen(true)}
            onOpenProfileEdit={() => setDevice1ProfileEditOpen(true)}
            onOpenTerms={() => setDevice1TermsModal('terms')}
            onOpenPrivacy={() => setDevice1TermsModal('privacy')}
            onLogout={() => {}}
            onSwitchDeviceUser={() => {}}
          />
        )}

        {/* Active Call Modal for Device 1 */}
        {activeCall && (activeCall.callerId === 'user_alex' || activeCall.receiverId === 'user_alex') && (
          <CallModal
            call={activeCall}
            currentUser={alex}
            onAccept={() => realtimeStore.acceptCall()}
            onDecline={() => realtimeStore.declineCall()}
            onEndCall={() => realtimeStore.endCall()}
            onToggleMute={() => realtimeStore.toggleMute()}
            onToggleCamera={() => realtimeStore.toggleCamera()}
            onToggleSpeaker={() => realtimeStore.toggleSpeaker()}
          />
        )}

        {device1NewChatOpen && (
          <NewChatModal
            currentUser={alex}
            onClose={() => setDevice1NewChatOpen(false)}
            onSelectUser={(id) => {
              setDevice1NewChatOpen(false);
              setDevice1ActiveChat(id);
            }}
          />
        )}

        {device1PrivacyOpen && (
          <PrivacySettingsModal
            currentUser={alex}
            onClose={() => setDevice1PrivacyOpen(false)}
          />
        )}

        {device1ProfileEditOpen && (
          <ProfileEditModal
            currentUser={alex}
            onClose={() => setDevice1ProfileEditOpen(false)}
          />
        )}

        {device1TermsModal && (
          <TermsAndPrivacyModal
            type={device1TermsModal}
            onClose={() => setDevice1TermsModal(null)}
          />
        )}
      </AndroidFrame>

      {/* DEVICE 2: Maya Chen */}
      <AndroidFrame theme={theme} deviceLabel="Device 2 · Maya Chen (@maya_c)">
        {device2ActiveChat ? (
          <ChatScreen
            participantId={device2ActiveChat}
            currentUser={maya}
            messages={mayaChatMessages}
            onBack={() => setDevice2ActiveChat(null)}
            onStartVoiceCall={() => realtimeStore.startCall(device2ActiveChat, 'voice')}
            onStartVideoCall={() => realtimeStore.startCall(device2ActiveChat, 'video')}
            onViewProfile={() => {}}
          />
        ) : (
          <HomeScreen
            currentUser={maya}
            conversations={mayaConversations}
            callHistory={mayaCalls}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onOpenChat={(id) => setDevice2ActiveChat(id)}
            onOpenNewChatModal={() => setDevice2NewChatOpen(true)}
            onStartVoiceCall={(id) => realtimeStore.startCall(id, 'voice')}
            onStartVideoCall={(id) => realtimeStore.startCall(id, 'video')}
            onOpenPrivacySettings={() => setDevice2PrivacyOpen(true)}
            onOpenProfileEdit={() => setDevice2ProfileEditOpen(true)}
            onOpenTerms={() => setDevice2TermsModal('terms')}
            onOpenPrivacy={() => setDevice2TermsModal('privacy')}
            onLogout={() => {}}
            onSwitchDeviceUser={() => {}}
          />
        )}

        {/* Active Call Modal for Device 2 */}
        {activeCall && (activeCall.callerId === 'user_maya' || activeCall.receiverId === 'user_maya') && (
          <CallModal
            call={activeCall}
            currentUser={maya}
            onAccept={() => realtimeStore.acceptCall()}
            onDecline={() => realtimeStore.declineCall()}
            onEndCall={() => realtimeStore.endCall()}
            onToggleMute={() => realtimeStore.toggleMute()}
            onToggleCamera={() => realtimeStore.toggleCamera()}
            onToggleSpeaker={() => realtimeStore.toggleSpeaker()}
          />
        )}

        {device2NewChatOpen && (
          <NewChatModal
            currentUser={maya}
            onClose={() => setDevice2NewChatOpen(false)}
            onSelectUser={(id) => {
              setDevice2NewChatOpen(false);
              setDevice2ActiveChat(id);
            }}
          />
        )}

        {device2PrivacyOpen && (
          <PrivacySettingsModal
            currentUser={maya}
            onClose={() => setDevice2PrivacyOpen(false)}
          />
        )}

        {device2ProfileEditOpen && (
          <ProfileEditModal
            currentUser={maya}
            onClose={() => setDevice2ProfileEditOpen(false)}
          />
        )}

        {device2TermsModal && (
          <TermsAndPrivacyModal
            type={device2TermsModal}
            onClose={() => setDevice2TermsModal(null)}
          />
        )}
      </AndroidFrame>
    </div>
  );
};
