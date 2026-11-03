import React, { useState } from 'react';
import { Camera, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { validateUsername } from '../utils/connectaLogic';
import { realtimeStore } from '../services/realtimeStore';

interface ProfileSetupViewProps {
  initialDisplayName?: string;
  onProfileCreated: (profileData: {
    displayName: string;
    username: string;
    bio: string;
    profilePicture: string;
  }) => void;
}

const PRESET_AVATARS = [
  '/src/assets/images/user_avatar_alex_1793738752217.jpg',
  '/src/assets/images/user_avatar_maya_1793738766445.jpg',
  '/src/assets/images/sample_shared_photo_1793738783795.jpg'
];

export const ProfileSetupView: React.FC<ProfileSetupViewProps> = ({
  initialDisplayName = '',
  onProfileCreated
}) => {
  const [displayName, setDisplayName] = useState(initialDisplayName || 'Alex Rivera');
  const [username, setUsername] = useState('alex_r');
  const [bio, setBio] = useState('Available on CONNECTA');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Display name is required.');
      return;
    }

    const validation = validateUsername(username);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Invalid username.');
      return;
    }

    // Check duplicate username against existing users
    const cleanUser = username.trim().toLowerCase();
    const existingUsers = realtimeStore.getAllProfiles();
    const duplicate = existingUsers.some(
      (u) => u.username.toLowerCase() === cleanUser && u.userId !== 'user_alex'
    );
    if (duplicate) {
      setErrorMsg('This username is already taken. Please choose another.');
      return;
    }

    onProfileCreated({
      displayName: displayName.trim(),
      username: cleanUser,
      bio: bio.trim(),
      profilePicture: selectedAvatar
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 select-none overflow-y-auto">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create Your Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Set up how friends and contacts will identify you on CONNECTA.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar selector */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img
                src={selectedAvatar}
                alt="Selected Avatar"
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-indigo-500/40"
              />
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-indigo-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-slate-500">Presets:</span>
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAvatar(url)}
                  className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                    selectedAvatar === url
                      ? 'border-indigo-600 scale-110 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              maxLength={50}
              required
              className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm font-medium focus:outline-none"
            />
          </div>

          {/* Unique Username */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Unique Username *
              </label>
              <span className="text-[10px] text-slate-500">3-20 chars (a-z, 0-9, _)</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-semibold text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setErrorMsg('');
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                }}
                placeholder="alex_r"
                maxLength={20}
                required
                className="w-full h-12 pl-8 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm font-mono focus:outline-none"
              />
              {validateUsername(username).isValid && (
                <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-4" />
              )}
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Short Bio (Optional)
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell friends what you're up to..."
              maxLength={160}
              className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <span>Complete Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
