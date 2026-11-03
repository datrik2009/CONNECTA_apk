import React, { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { SplashView } from './components/SplashView';
import { OnboardingView } from './components/OnboardingView';
import { AuthView } from './components/AuthView';
import { ProfileSetupView } from './components/ProfileSetupView';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { CallModal } from './components/CallModal';
import { NewChatModal } from './components/NewChatModal';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { TermsAndPrivacyModal } from './components/TermsAndPrivacyModal';
import { DualDeviceView } from './components/DualDeviceView';
import { NativeCodeInspector } from './components/NativeCodeInspector';
import { realtimeStore } from './services/realtimeStore';
import { UserProfile } from './types';
import { Smartphone, SplitSquareVertical, Code2, Sun, Moon, RotateCcw } from 'lucide-react';

type AppStep = 'splash' | 'onboarding' | 'auth' | 'profile_setup' | 'main';

export default function App() {
  const [step, setStep] = useState<AppStep>(() => {
    // Check if autostart query parameter is passed (Ultra Mode requirement)
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      return 'main';
    }
    const onboarded = localStorage.getItem('connecta_onboarded_completed');
    if (onboarded) return 'main';
    return 'splash';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('single');
  const [codeInspectorOpen, setCodeInspectorOpen] = useState(false);

  // Active single-device state
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [profileEditModalOpen, setProfileEditModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Reactive store binding
  const [currentUser, setCurrentUser] = useState<UserProfile>(realtimeStore.getCurrentUser());
  const [conversations, setConversations] = useState(realtimeStore.getConversations());
  const [callHistory, setCallHistory] = useState(realtimeStore.getCallHistory());
  const [activeCall, setActiveCall] = useState(realtimeStore.getActiveCall());

  useEffect(() => {
    // Update theme class on HTML element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const unsubscribe = realtimeStore.subscribe(() => {
      setCurrentUser(realtimeStore.getCurrentUser());
      setConversations(realtimeStore.getConversations());
      setCallHistory(realtimeStore.getCallHistory());
      setActiveCall(realtimeStore.getActiveCall());
    });
    return unsubscribe;
  }, []);

  const handleFinishSplash = () => {
    const onboarded = localStorage.getItem('connecta_onboarded_completed');
    if (onboarded) {
      setStep('main');
    } else {
      setStep('onboarding');
    }
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('connecta_onboarded_completed', 'true');
    setStep('auth');
  };

  const handleAuthenticated = (authData: { method: 'google' | 'phone'; identifier: string; displayName?: string }) => {
    setStep('profile_setup');
  };

  const handleProfileCreated = (profileData: {
    displayName: string;
    username: string;
    bio: string;
    profilePicture: string;
  }) => {
    realtimeStore.updateProfile(profileData);
    setStep('main');
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('connecta_onboarded_completed');
    setActiveChatUserId(null);
    setStep('splash');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const activeChatMessages = activeChatUserId
    ? realtimeStore.getMessages(realtimeStore.getChatId(currentUser.userId, activeChatUserId))
    : [];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070A10] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-between transition-colors">
      {/* Top Application Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/connecta_logo_mark_1793738738164.jpg"
            alt="CONNECTA"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-xl object-cover shadow-md border border-indigo-500/30"
          />
          <div>
            <h1 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              <span>CONNECTA</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                Native Android Messenger
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stay Connected. Anytime. Anywhere.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5">
          {/* Single vs Dual Phone Simulator Switch */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Single Phone</span>
            </button>
            <button
              onClick={() => {
                setViewMode('dual');
                setStep('main');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'dual'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Dual Device Sync</span>
            </button>
          </div>

          {/* Android Kotlin & WebRTC Source Inspector */}
          <button
            onClick={() => setCodeInspectorOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Android Codebase</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Reset Onboarding Demo */}
          <button
            onClick={handleRestartOnboarding}
            title="Restart Onboarding & Welcome Flow"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="w-full max-w-7xl mx-auto px-4 py-6 flex-1 flex flex-col items-center justify-center">
        {viewMode === 'dual' ? (
          <DualDeviceView theme={theme} onToggleTheme={toggleTheme} />
        ) : (
          <AndroidFrame theme={theme} deviceLabel="Pixel 8 · Android 14 Material 3">
            {step === 'splash' && <SplashView onFinish={handleFinishSplash} />}

            {step === 'onboarding' && <OnboardingView onComplete={handleCompleteOnboarding} />}

            {step === 'auth' && (
              <AuthView
                onAuthenticated={handleAuthenticated}
                onOpenTerms={() => setLegalModal('terms')}
                onOpenPrivacy={() => setLegalModal('privacy')}
              />
            )}

            {step === 'profile_setup' && (
              <ProfileSetupView
                initialDisplayName={currentUser.displayName}
                onProfileCreated={handleProfileCreated}
              />
            )}

            {step === 'main' && (
              <>
                {activeChatUserId ? (
                  <ChatScreen
                    participantId={activeChatUserId}
                    currentUser={currentUser}
                    messages={activeChatMessages}
                    onBack={() => setActiveChatUserId(null)}
                    onStartVoiceCall={() => realtimeStore.startCall(activeChatUserId, 'voice')}
                    onStartVideoCall={() => realtimeStore.startCall(activeChatUserId, 'video')}
                    onViewProfile={(uid) => alert(`Profile for @${realtimeStore.getProfile(uid)?.username}: ${realtimeStore.getProfile(uid)?.bio}`)}
                  />
                ) : (
                  <HomeScreen
                    currentUser={currentUser}
                    conversations={conversations}
                    callHistory={callHistory}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    onOpenChat={(id) => setActiveChatUserId(id)}
                    onOpenNewChatModal={() => setNewChatModalOpen(true)}
                    onStartVoiceCall={(id) => realtimeStore.startCall(id, 'voice')}
                    onStartVideoCall={(id) => realtimeStore.startCall(id, 'video')}
                    onOpenPrivacySettings={() => setPrivacyModalOpen(true)}
                    onOpenProfileEdit={() => setProfileEditModalOpen(true)}
                    onOpenTerms={() => setLegalModal('terms')}
                    onOpenPrivacy={() => setLegalModal('privacy')}
                    onLogout={() => {
                      localStorage.removeItem('connecta_onboarded_completed');
                      setStep('auth');
                    }}
                    onSwitchDeviceUser={(uid) => realtimeStore.setCurrentUser(uid)}
                  />
                )}

                {/* Active Call Modal Overlay */}
                {activeCall && (
                  <CallModal
                    call={activeCall}
                    currentUser={currentUser}
                    onAccept={() => realtimeStore.acceptCall()}
                    onDecline={() => realtimeStore.declineCall()}
                    onEndCall={() => realtimeStore.endCall()}
                    onToggleMute={() => realtimeStore.toggleMute()}
                    onToggleCamera={() => realtimeStore.toggleCamera()}
                    onToggleSpeaker={() => realtimeStore.toggleSpeaker()}
                  />
                )}

                {/* New Conversation Modal */}
                {newChatModalOpen && (
                  <NewChatModal
                    currentUser={currentUser}
                    onClose={() => setNewChatModalOpen(false)}
                    onSelectUser={(uid) => {
                      setNewChatModalOpen(false);
                      setActiveChatUserId(uid);
                    }}
                  />
                )}

                {/* Privacy Settings Modal */}
                {privacyModalOpen && (
                  <PrivacySettingsModal
                    currentUser={currentUser}
                    onClose={() => setPrivacyModalOpen(false)}
                  />
                )}

                {/* Profile Edit Modal */}
                {profileEditModalOpen && (
                  <ProfileEditModal
                    currentUser={currentUser}
                    onClose={() => setProfileEditModalOpen(false)}
                  />
                )}

                {/* Legal Terms / Privacy Modal */}
                {legalModal && (
                  <TermsAndPrivacyModal
                    type={legalModal}
                    onClose={() => setLegalModal(null)}
                  />
                )}
              </>
            )}
          </AndroidFrame>
        )}
      </main>

      {/* Kotlin Android Code Inspector Modal */}
      {codeInspectorOpen && (
        <NativeCodeInspector onClose={() => setCodeInspectorOpen(false)} />
      )}

      {/* Footer Info */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span>CONNECTA Android Architecture · Material 3</span>
          <span>·</span>
          <span>WebRTC Voice & Video</span>
          <span>·</span>
          <span>Cloud Firestore</span>
        </div>
        <div>
          <span>End-to-End Encrypted Private Communications</span>
        </div>
      </footer>
    </div>
  );
}
