import React, { useState } from 'react';
import { MessageSquare, PhoneCall, Users, ArrowRight } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: MessageSquare,
    title: 'Private Messaging',
    subtitle: 'Stay connected with the people who matter.',
    accent: 'from-indigo-600 to-indigo-800'
  },
  {
    icon: PhoneCall,
    title: 'Voice & Video Calls',
    subtitle: 'Talk face-to-face or hear their voice from anywhere.',
    accent: 'from-violet-600 to-purple-800'
  },
  {
    icon: Users,
    title: 'Simple Connections',
    subtitle: 'Everything you need to communicate in one place.',
    accent: 'from-blue-600 to-indigo-700'
  }
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 select-none">
      {/* Top bar with Skip button */}
      <div className="flex justify-end pt-2">
        {currentSlide < SLIDES.length - 1 ? (
          <button
            onClick={onComplete}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Skip
          </button>
        ) : (
          <div className="h-7" />
        )}
      </div>

      {/* Animated Center Content */}
      <div className="my-auto text-center px-4">
        <div key={currentSlide} className="flex flex-col items-center animate-fade-in transition-all">
          <div
            className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${slide.accent} flex items-center justify-center text-white shadow-xl shadow-indigo-900/20 mb-8`}
          >
            <Icon className="w-12 h-12" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-3">
            {slide.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
            {slide.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom controls: Slide indicator dots + Action CTA */}
      <div className="space-y-6 pb-2">
        {/* Indicators */}
        <div className="flex justify-center items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-7 bg-indigo-600 dark:bg-indigo-400'
                  : 'w-2 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>{currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
