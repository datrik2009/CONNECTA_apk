import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface TermsAndPrivacyModalProps {
  type: 'terms' | 'privacy';
  onClose: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  type,
  onClose
}) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          {type === 'terms' ? (
            <>
              <h4 className="font-bold text-slate-900 dark:text-white">1. Service Agreement</h4>
              <p>
                CONNECTA provides private real-time messaging, voice calling, and video calling
                services powered by WebRTC and secure cloud signaling. By using CONNECTA, you agree to
                abide by community guidelines ensuring a respectful, spam-free environment.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white">2. Permitted Use</h4>
              <p>
                You may not use CONNECTA for unsolicited advertising, harassment, distribution of
                malware, or any unlawful activities. Abusive accounts are subject to immediate blocking
                and deletion.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white">3. Calling & Media Data</h4>
              <p>
                Voice and video calls establish peer-to-peer WebRTC connections. Media data is not
                recorded or stored on CONNECTA servers.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-slate-900 dark:text-white">1. Zero Contact Harvesting</h4>
              <p>
                CONNECTA never uploads or shares your contact address book without explicit permission.
                Your phone number is strictly private and never displayed publicly.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white">2. End-to-End Privacy</h4>
              <p>
                Private conversations are restricted strictly to conversation participants. We do not
                sell or monetize your personal communications.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white">3. Data Deletion</h4>
              <p>
                You can delete your messages locally at any time. When an account is removed, all
                associated signaling records and profile information are permanently erased.
              </p>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shrink-0"
        >
          Close
        </button>
      </div>
    </div>
  );
};
