import React, { useEffect, useState } from 'react';

interface SplashViewProps {
  onFinish: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-950 via-[#0B0F19] to-[#0B0F19] text-white select-none">
      <div
        className={`relative mb-6 transition-all duration-700 ease-out transform ${
          mounted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        {/* Glow ambient ring */}
        <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />

        <img
          src="/src/assets/images/connecta_logo_mark_1793738738164.jpg"
          alt="CONNECTA Logo"
          referrerPolicy="no-referrer"
          className="relative w-28 h-28 rounded-3xl object-cover shadow-2xl border border-indigo-500/30"
        />
      </div>

      <div
        className={`text-center transition-all duration-700 delay-200 ease-out transform ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          CONNECTA
        </h1>
        <p className="text-sm font-medium text-indigo-300/80 tracking-wide">
          Stay Connected. Anytime. Anywhere.
        </p>
      </div>

      <div
        className={`mt-12 flex items-center gap-1.5 transition-opacity duration-500 delay-500 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

