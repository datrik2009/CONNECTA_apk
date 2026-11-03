import React, { useState } from 'react';
import { Search, X, MessageSquare, UserPlus, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { realtimeStore } from '../services/realtimeStore';

interface NewChatModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  currentUser,
  onClose,
  onSelectUser
}) => {
  const [searchUsername, setSearchUsername] = useState('');
  const allProfiles = realtimeStore.getAllProfiles().filter((p) => p.userId !== currentUser.userId);

  const cleanQuery = searchUsername.trim().toLowerCase().replace('@', '');

  const searchResults = cleanQuery
    ? allProfiles.filter(
        (p) =>
          p.username.toLowerCase().includes(cleanQuery) ||
          p.displayName.toLowerCase().includes(cleanQuery)
      )
    : [];

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-40 p-3 select-none">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">New Conversation</h2>
            <p className="text-xs text-slate-500">Find someone by their CONNECTA @username</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-4 mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Type exact @username or name..."
            autoFocus
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Search Results / Suggested Contacts */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {cleanQuery ? (
            searchResults.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-500" />
                <p className="text-xs font-semibold">No users found for "@{cleanQuery}"</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Check the spelling or try searching another username.
                </p>
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.userId}
                  onClick={() => onSelectUser(user.userId)}
                  className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePicture}
                      alt={user.displayName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {user.displayName}
                      </h4>
                      <p className="text-[11px] font-mono text-indigo-500">@{user.username}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-44 mt-0.5">
                        {user.bio}
                      </p>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>
              ))
            )
          ) : (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Suggested Contacts
              </span>
              <div className="space-y-2">
                {allProfiles.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => onSelectUser(user.userId)}
                    className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePicture}
                        alt={user.displayName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                          {user.displayName}
                        </h4>
                        <p className="text-[11px] font-mono text-indigo-500">@{user.username}</p>
                      </div>
                    </div>
                    <UserPlus className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
