import React, { useState } from 'react';
import { DecisionReport } from '../types/decision';
import { DecisionGraphNodes } from './DecisionGraphNodes';
import { SignaturePipeline } from './SignaturePipeline';
import { ScoreGauge } from './ScoreGauge';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStartDecision: (initialQuery?: string) => void;
  onSelectSample: (sample: DecisionReport) => void;
  sampleDecisions: DecisionReport[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDecision,
  onSelectSample,
  sampleDecisions,
}) => {
  const [heroInput, setHeroInput] = useState<string>('');
  const [isProcessingDemo, setIsProcessingDemo] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('Researching');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = heroInput.trim() || 'Should I accept this ₹8 LPA software developer job in Chennai?';

    setIsProcessingDemo(true);
    const stages = ['Researching', 'Comparing', 'Calculating', 'Deciding'];
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < stages.length) {
        setProcessingStage(stages[idx]);
      } else {
        clearInterval(interval);
        setIsProcessingDemo(false);
        onStartDecision(query);
      }
    }, 400);
  };

  return (
    <div className="space-y-0 selection:bg-[#B9E5F3] selection:text-[#090B0C]">
      {/* 1. HERO SECTION (Dark Section: #090B0C) */}
      <section className="relative px-4 text-center max-w-5xl mx-auto pt-14 pb-16 overflow-hidden">
        {/* Subtle animated decision network */}
        <div className="absolute inset-0 z-0 opacity-25">
          <DecisionGraphNodes className="w-full h-full" />
        </div>

        <div className="relative z-10">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#0F1214] text-xs font-mono mb-8 text-[#F5F5F2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9E5F3]" />
            <span>AI Decision Intelligence</span>
          </div>

          {/* Official FEZI 3D Logo Emblem */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <img
                src="/fezi-icon.png"
                alt="FEZI Emblem"
                className="w-20 h-20 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_10px_28px_rgba(185,229,243,0.35)] animate-float"
              />
            </div>
          </div>

          {/* Big FEZI Wordmark */}
          <h1 className="text-7xl sm:text-9xl font-serif text-[#F5F5F2] tracking-tight mb-2 font-normal select-none">
            FEZI
          </h1>

          {/* Core Tagline with Ice Blue italic emphasis */}
          <h2 className="text-2xl sm:text-4xl font-serif text-[#F5F5F2] mb-6 font-normal">
            Decide with <span className="italic text-[#B9E5F3]">evidence</span>.
          </h2>

          <p className="text-sm sm:text-base text-[#8E959E] max-w-xl mx-auto mb-10 leading-relaxed font-sans">
            Turn complex real-world dilemmas into structured, evidence-based choices.
            No generic chatbot opinions — only deterministic decision models.
          </p>

          {/* Decision Input Box with AI Processing Animation */}
          <div className="max-w-2xl mx-auto rounded-2xl bg-[#0F1214] p-2 border border-white/10 shadow-2xl mb-5">
            <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full text-left">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="Should I accept this job?"
                  disabled={isProcessingDemo}
                  className="w-full pl-4 pr-3 py-3 rounded-xl bg-transparent text-sm sm:text-base text-[#F5F5F2] placeholder-[#8E959E]/60 focus:outline-none font-sans"
                />
              </div>

              {/* Primary CTA: #B9E5F3 background with #090B0C text */}
              <button
                type="submit"
                disabled={isProcessingDemo}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B9E5F3] hover:bg-[#a5d8e7] text-[#090B0C] font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shrink-0 font-sans disabled:opacity-75"
              >
                {isProcessingDemo ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#090B0C] animate-ping" />
                    {processingStage} →
                  </span>
                ) : (
                  <>
                    <span>Analyze with FEZI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Decision Starters (Secondary buttons with transparent bg + border) */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#8E959E] max-w-2xl mx-auto">
            <span>Examples:</span>
            {[
              'Should I accept this ₹8 LPA job in Chennai?',
              'Should I move from London to Dubai?',
              'Should I start this B2B SaaS venture?',
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setHeroInput(preset);
                  onStartDecision(preset);
                }}
                className="px-2.5 py-1 rounded-lg bg-transparent border border-white/10 hover:border-white/30 text-[#F5F5F2] transition text-left"
              >
                "{preset}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE ANALYSIS PIPELINE (Light Section: #F5F5F2 Paper background) */}
      <SignaturePipeline />

      {/* 3. DETERMINISTIC SCORE MODEL (Dark Section: #090B0C) */}
      <section className="py-20 px-4 max-w-5xl mx-auto text-left">
        <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-10 border border-white/10 shadow-2xl">
          <div className="text-center max-w-md mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B9E5F3]">
              Deterministic Framework
            </span>
            <h3 className="text-3xl font-serif text-[#F5F5F2] mt-1 font-normal">
              Explainable Decision Model
            </h3>
            <p className="text-xs text-[#8E959E] mt-1 font-sans">
              Score = Sum(Weight% × Factor Score). Zero LLM hallucinations in final arithmetic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Score Ring */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#090B0C] border border-white/5">
              <ScoreGauge score={78} verdict="LEAN YES" size={190} />

              <div className="mt-4 pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs font-mono">
                <span className="text-[#8E959E]">Confidence:</span>
                <span className="px-2 py-0.5 rounded-full border border-white/15 text-[#F5F5F2]">
                  MEDIUM (74%)
                </span>
              </div>
            </div>

            {/* Factor Bars */}
            <div className="md:col-span-7 space-y-3 font-sans">
              <div className="text-xs font-mono text-[#8E959E] uppercase tracking-wider mb-2">
                Factor Weighted Calculation
              </div>

              {[
                { name: 'Career Growth', weight: 30, raw: 85, pts: 25.5 },
                { name: 'Compensation & Net', weight: 25, raw: 78, pts: 19.5 },
                { name: 'Market Stability', weight: 15, raw: 82, pts: 12.3 },
                { name: 'Work-Life Balance', weight: 15, raw: 65, pts: 9.75 },
                { name: 'Location & Commute', weight: 15, raw: 70, pts: 10.5 },
              ].map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#090B0C] border border-white/5">
                  <div className="flex justify-between text-xs font-medium text-[#F5F5F2] mb-1">
                    <span>{f.name} ({f.weight}%)</span>
                    <span className="font-mono text-[#B9E5F3]">+{f.pts} pts</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B9E5F3] rounded-full"
                      style={{ width: `${f.raw}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#8E959E]">
                <span>Tipping Point:</span>
                <span className="text-[#F5F5F2] border-b border-[#B9E5F3] pb-0.5">Salary &lt; ₹7.2L → NEUTRAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL DECISION DOSSIERS (Dark Section: #090B0C) */}
      <section className="py-12 px-4 max-w-5xl mx-auto text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
              Benchmark Dossiers
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#F5F5F2] mt-1 font-normal">
              Explore Verified Decisions
            </h2>
            <p className="text-xs text-[#8E959E] mt-1 font-sans">
              Click any verified case study to inspect the complete explainable intelligence report.
            </p>
          </div>

          <button
            onClick={() => onStartDecision()}
            className="flex items-center gap-1.5 text-xs font-mono text-[#B9E5F3] hover:underline"
          >
            <span>Analyze Custom Decision</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleDecisions.map((sample) => {
            return (
              <div
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className="group rounded-3xl bg-[#0F1214] p-6 border border-white/5 hover:border-white/20 transition cursor-pointer flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border border-white/10 text-[#8E959E]">
                      {sample.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#8E959E]">
                      Confidence: <strong className="text-[#F5F5F2]">{sample.confidence}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-serif text-[#F5F5F2] group-hover:text-[#B9E5F3] transition leading-snug mb-3">
                    "{sample.title}"
                  </h3>

                  <p className="text-xs text-[#8E959E] line-clamp-2 leading-relaxed mb-6 font-sans">
                    {sample.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif text-[#B9E5F3]">
                      {sample.score}
                    </span>
                    <span className="text-xs text-[#8E959E] font-mono">/100</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium uppercase tracking-wider border border-white/15 text-[#F5F5F2]">
                    {sample.verdict}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FOOTER (Dark Section) */}
      <footer className="pt-16 pb-12 border-t border-white/5 text-center text-xs text-[#8E959E] max-w-4xl mx-auto px-4 space-y-3 font-sans">
        <p className="text-[#8E959E]/70 max-w-lg mx-auto">
          FEZI provides structured analytical intelligence for decision support. Critical financial and legal considerations should always be independently verified.
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-[#8E959E]/60 pt-2">
          <span>FEZI AI DECISION INTELLIGENCE</span>
          <span>•</span>
          <span>DECIDE WITH EVIDENCE</span>
        </div>
      </footer>
    </div>
  );
};
