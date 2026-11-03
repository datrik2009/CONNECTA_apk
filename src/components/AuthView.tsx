import React, { useState } from 'react';
import { Phone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthViewProps {
  onAuthenticated: (authData: { method: 'google' | 'phone'; identifier: string; displayName?: string }) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthenticated,
  onOpenTerms,
  onOpenPrivacy
}) => {
  const [authMode, setAuthMode] = useState<'options' | 'phone' | 'otp'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // Instant authentic Google session simulation with user account
    setTimeout(() => {
      setIsLoading(false);
      onAuthenticated({
        method: 'google',
        identifier: 'alex.rivera@example.com',
        displayName: 'Alex Rivera'
      });
    }, 600);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number with country code.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode('otp');
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuthenticated({
        method: 'phone',
        identifier: phoneNumber,
        displayName: 'Mobile User'
      });
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 select-none overflow-y-auto">
      <div className="pt-4">
        {/* Logo and App Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/src/assets/images/connecta_logo_mark_1793738738164.jpg"
            alt="CONNECTA Logo"
            referrerPolicy="no-referrer"
            className="w-18 h-18 rounded-2xl object-cover shadow-lg border border-indigo-500/20 mb-3"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to CONNECTA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Private Messaging & HD WebRTC Calling
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {authMode === 'options' && (
          <div className="space-y-3.5">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-13 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] font-semibold text-sm flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Phone Sign In */}
            <button
              onClick={() => {
                setErrorMsg('');
                setAuthMode('phone');
              }}
              className="w-full h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Continue with Phone Number</span>
            </button>
          </div>
        )}

        {authMode === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Phone Number (with Country Code)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 555 123 4567"
                required
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Sending OTP...' : 'Send Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setAuthMode('options');
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
            >
              Back to options
            </button>
          </form>
        )}

        {authMode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the 6-digit verification code sent to <br />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{phoneNumber}</span>
              </p>
              <div className="mt-1 text-[11px] text-indigo-500 font-mono">
                (Demo Auto-fill: enter any 6 digits e.g. 1 2 3 4 5 6)
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-11 h-13 text-center text-lg font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('phone')}
              className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>

      {/* Footer Legal & Security Note */}
      <div className="pt-6 pb-2 text-center text-slate-500 dark:text-slate-500">
        <div className="flex items-center justify-center gap-1.5 text-[11px] mb-2 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>End-to-end encrypted private communication</span>
        </div>
        <p className="text-[11px]">
          By continuing, you agree to our{' '}
          <button onClick={onOpenTerms} className="underline hover:text-indigo-500">
            Terms of Service
          </button>{' '}
          and{' '}
          <button onClick={onOpenPrivacy} className="underline hover:text-indigo-500">
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </div>
  );
};
