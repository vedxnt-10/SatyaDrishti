import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CircleNotch, CheckCircle } from '@phosphor-icons/react';

const steps = [
  { label: 'Initializing forensic pipeline', module: 'SYS' },
  { label: 'Extracting text via OCR', module: 'OCR' },
  { label: 'Computing pixel variance map', module: 'ELA' },
  { label: 'Generating compression heatmap', module: 'ELA' },
  { label: 'Validating QR cryptographic signatures', module: 'SEC' },
  { label: 'Scanning for AI generation patterns', module: 'AI' },
  { label: 'Synthesizing multilayer risk score', module: 'SYS' },
];

const ease = [0.32, 0.72, 0, 1];

export default function ProcessingSteps({ onComplete, isApiDone }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        // If we are at the last step, we MUST wait for the API to be done before completing
        if (prev === steps.length - 1) {
          if (isApiDone) {
            clearInterval(interval);
            setTimeout(onComplete, 500);
            return prev;
          }
          // Stall at 100% if API isn't done yet
          return prev;
        }
        
        // If we are at the second to last step (99%), stall there if API isn't done
        if (prev === steps.length - 2 && !isApiDone) {
           return prev; // Stall here to indicate we are still working
        }

        return prev + 1;
      });
    }, 800); // Slowed down from 420 to 800 to make the animation last longer (more realistic)
    return () => clearInterval(interval);
  }, [onComplete, isApiDone]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-card overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircleNotch
              size={16}
              weight="bold"
              className="text-accent-primary animate-spin"
            />
            <span className="text-sm font-medium text-text-primary">
              Analyzing document
            </span>
          </div>
          <span className="text-xs font-mono text-text-muted tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-bg-elevated">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-cyan"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Step list */}
        <div className="p-6 space-y-3 min-h-[340px]">
          {steps.map((step, idx) => {
            if (idx > currentStep) return null;

            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3"
              >
                {/* Status icon */}
                {isDone ? (
                  <CheckCircle
                    size={16}
                    weight="fill"
                    className="text-accent-primary flex-shrink-0"
                  />
                ) : (
                  <CircleNotch
                    size={16}
                    weight="bold"
                    className="text-accent-cyan animate-spin flex-shrink-0"
                  />
                )}

                {/* Label */}
                <span
                  className={`text-sm flex-1 ${
                    isCurrent ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {step.label}
                </span>

                {/* Module tag */}
                <span className="text-[10px] font-mono text-text-muted tracking-wider">
                  {step.module}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
