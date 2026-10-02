import React, { useEffect, useState } from 'react';
import { Cpu, Search, ShieldCheck, Database, Layers, Sparkles, Check } from 'lucide-react';

interface AnalysisLoadingProps {
  decisionTitle: string;
  onComplete: () => void;
}

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  decisionTitle,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      title: 'Context & Baseline Extraction',
      detail: `Deconstructing "${decisionTitle.slice(0, 42)}..." into parameter vectors...`,
      icon: Cpu,
    },
    {
      title: 'Authoritative Benchmark Queries',
      detail: 'Connecting to Tamil Nadu IT Wage Index, AmbitionBox & Numbeo datasets...',
      icon: Search,
    },
    {
      title: 'Evidence Classification Ledger',
      detail: 'Classifying statements as VERIFIED, ESTIMATED, USER PROVIDED, or UNKNOWN...',
      icon: ShieldCheck,
    },
    {
      title: 'Deterministic Weighted Scoring Engine',
      detail: 'Calculating exact factor points (Growth 30%, Salary 25%, Stability 15%)...',
      icon: Database,
    },
    {
      title: 'Multi-Scenario Simulation',
      detail: 'Modeling Best-Case upside vs Stressed Worst-Case conditions...',
      icon: Layers,
    },
    {
      title: 'Sensitivity Boundary Formulation',
      detail: 'Establishing critical threshold boundaries (Salary < ₹7.2L → NEUTRAL)...',
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => onComplete(), 700);
          return prev;
        }
      });
    }, 550);

    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 max-w-xl mx-auto text-center font-sans selection:bg-[#B9E5F3] selection:text-[#090B0C]">
      {/* Precision Core Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#0F1214] border border-white/10 flex items-center justify-center text-[#B9E5F3] mb-6 shadow-sm">
        <Cpu className="w-7 h-7" />
      </div>

      <div className="text-[11px] font-mono uppercase tracking-widest text-[#B9E5F3] mb-2">
        FEZI Intelligence Pipeline
      </div>
      <h2 className="text-3xl font-serif text-[#F5F5F2] font-normal mb-2">
        Synthesizing Decision
      </h2>
      <p className="text-xs text-[#8E959E] mb-8 max-w-md line-clamp-1 font-mono">
        "{decisionTitle}"
      </p>

      {/* Progress Bar (Monochrome + Ice Blue fill) */}
      <div className="w-full bg-white/10 rounded-full h-1 mb-8 overflow-hidden">
        <div
          className="h-full bg-[#B9E5F3] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Pipeline Steps List */}
      <div className="w-full space-y-2.5 text-left font-sans">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3.5 ${
                isCurrent
                  ? 'bg-[#0F1214] border-[#B9E5F3] text-[#F5F5F2]'
                  : isDone
                  ? 'bg-[#0F1214]/60 border-white/5 text-[#8E959E]'
                  : 'bg-transparent border-transparent text-[#8E959E]/40'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shrink-0 ${
                  isCurrent
                    ? 'bg-[#B9E5F3] text-[#090B0C] font-bold'
                    : isDone
                    ? 'border border-white/20 text-[#F5F5F2]'
                    : 'border border-white/10 text-[#8E959E]'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : `0${idx + 1}`}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium flex items-center justify-between font-mono">
                  <span>{step.title}</span>
                  {isDone && <span className="text-[10px] text-[#8E959E]">DONE</span>}
                  {isCurrent && <span className="text-[10px] text-[#B9E5F3] animate-pulse">PROCESSING</span>}
                </div>
                <div className="text-[11px] text-[#8E959E] truncate mt-0.5 font-sans">{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
