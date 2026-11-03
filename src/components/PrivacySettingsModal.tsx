import React from 'react';
import { X, Shield, Lock, Eye, Ban, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { realtimeStore } from '../services/realtimeStore';

interface PrivacySettingsModalProps {
  currentUser: UserProfile;
  onClose: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  currentUser,
  onClose
}) => {
  const privacy = currentUser.privacySettings;

  const handleToggleReadReceipts = () => {
    realtimeStore.updateProfile({
      privacySettings: {
        ...privacy,
        readReceipts: !privacy.readReceipts
      }
    });
  };

  const handleChangeLastSeen = (val: 'everyone' | 'contacts' | 'nobody') => {
    realtimeStore.updateProfile({
      privacySettings: {
        ...privacy,
        lastSeenVisibility: val
      }
    });
  };

  const handleUnblock = (userId: string) => {
    realtimeStore.unblockUser(userId);
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-40 p-3 select-none">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Privacy Controls</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Read Receipts */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <div className="pr-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Read Receipts</h4>
            <p className="text-[11px] text-slate-500">
              Show blue double-checks when you read messages.
            </p>
          </div>
          <button
            onClick={handleToggleReadReceipts}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              privacy.readReceipts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                privacy.readReceipts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Last Seen Visibility */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
            Who can see my Last Seen & Online
          </h4>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {(['everyone', 'contacts', 'nobody'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleChangeLastSeen(opt)}
                className={`py-2 px-2 rounded-xl capitalize font-medium border text-center transition-all ${
                  privacy.lastSeenVisibility === opt
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Blocked Accounts */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Blocked Contacts ({currentUser.blockedUsers.length})
            </h4>
          </div>

          {currentUser.blockedUsers.length === 0 ? (
            <p className="text-[11px] text-slate-500">No blocked contacts.</p>
          ) : (
            <div className="space-y-2 mt-2">
              {currentUser.blockedUsers.map((blockedId) => {
                const user = realtimeStore.getProfile(blockedId);
                return (
                  <div
                    key={blockedId}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">
                      {user?.displayName || blockedId}
                    </span>
                    <button
                      onClick={() => handleUnblock(blockedId)}
                      className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-semibold text-[11px] hover:bg-red-100"
                    >
                      Unblock
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
        >
          Save & Done
        </button>
      </div>
    </div>
  );
};
