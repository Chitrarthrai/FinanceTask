import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, Check } from 'lucide-react';
import { Button } from './Button';

export const OnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const steps = [
    {
      title: 'Welcome to FinanceTask Titanium!',
      description:
        'Your autonomous financial management platform. Let us take a 30-second guided tour of your workspace.',
      badge: 'Step 1 of 4',
    },
    {
      title: 'Executive Bento Grid Dashboard',
      description:
        'Monitor monthly net income, fixed expenses, target savings, and real-time daily budget pool allowances at a glance.',
      badge: 'Step 2 of 4',
    },
    {
      title: 'Titanium AI Floating Assistant',
      description:
        'Click the floating AI launcher button at the bottom-right anytime to log transactions, ask budget questions, or generate insights via Gemini AI.',
      badge: 'Step 3 of 4',
    },
    {
      title: 'Command Palette & Global Currency',
      description:
        'Press Cmd+K / Ctrl+K anytime to open the Command Palette, or use the header currency selector to switch between $, ₹, €, £, ¥, and A$.',
      badge: 'Step 4 of 4',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const current = steps[step];

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 glass-panel rounded-2xl border border-[var(--accent-primary)]/40 shadow-2xl p-5 animate-slide-up font-sans">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[var(--accent-primary-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-primary)]">
            {current.badge}
          </span>
        </div>
        <button
          onClick={handleComplete}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-bold text-sm font-display text-[var(--text-primary)] mb-1">
        {current.title}
      </h3>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
        {current.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-rim)]">
        <div className="flex gap-1">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === step
                  ? 'w-5 bg-[var(--accent-primary)]'
                  : 'bg-[var(--surface-l2)] border border-[var(--border-rim)]'
              }`}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleNext}
          rightIcon={step === steps.length - 1 ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        >
          {step === steps.length - 1 ? 'Finish Tour' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
