import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryCharging } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  deviceLabel?: string;
  className?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  theme,
  deviceLabel,
  className = ''
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {deviceLabel && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          {deviceLabel}
        </div>
      )}

      {/* Modern Android Phone Bezel */}
      <div
        className={`relative w-[385px] h-[810px] rounded-[48px] p-3 shadow-2xl transition-all duration-300 border-[7px] ${
          theme === 'dark'
            ? 'bg-slate-950 border-slate-800 shadow-indigo-950/40 text-slate-100'
            : 'bg-slate-100 border-slate-300 shadow-slate-400/30 text-slate-900'
        }`}
      >
        {/* Hardware volume and power button accents */}
        <div className="absolute -left-[10px] top-28 w-[3px] h-10 bg-slate-400/60 rounded-l" />
        <div className="absolute -left-[10px] top-42 w-[3px] h-14 bg-slate-400/60 rounded-l" />
        <div className="absolute -right-[10px] top-32 w-[3px] h-12 bg-slate-400/60 rounded-r" />

        {/* Screen Container */}
        <div
          className={`relative w-full h-full rounded-[40px] overflow-hidden flex flex-col ${
            theme === 'dark' ? 'bg-[#0B0F19]' : 'bg-[#F8FAFC]'
          }`}
        >
          {/* Android Status Bar */}
          <div className="h-10 w-full shrink-0 px-6 pt-2 flex items-center justify-between text-xs font-medium z-30 select-none">
            {/* Clock */}
            <span className="tracking-tight font-semibold text-[13px]">{timeStr}</span>

            {/* Centered Camera Punch Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-indigo-900/80" />
            </div>

            {/* System Icons */}
            <div className="flex items-center gap-1.5 opacity-90 text-[11px]">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono">92%</span>
                <BatteryCharging className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Main App Viewport */}
          <div className="flex-1 overflow-hidden relative flex flex-col">{children}</div>

          {/* Android System Navigation Gesture Bar */}
          <div className="h-5 w-full shrink-0 flex items-center justify-center z-30 pointer-events-none pb-1">
            <div className="w-32 h-1 rounded-full bg-slate-400/50 dark:bg-slate-600/60" />
          </div>
        </div>
      </div>
    </div>
  );
};
