import React, { useState } from 'react';
import { Database, ShieldCheck, Layers, BarChart3, Sparkles } from 'lucide-react';

export const SignaturePipeline: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      id: 'context',
      name: 'YOUR CONTEXT',
      tag: 'Candidate Constraints & Baseline',
      desc: 'FEZI extracts explicit user inputs: ₹5.5L baseline, ₹8.0L Chennai offer, 45 min commute, hybrid mode, 2.5 YOE.',
      icon: Database,
      pill: 'Context Ingested',
      preview: {
        headline: 'Current vs Target Delta',
        stats: [
          { label: 'Current Base', value: '₹5.5 LPA' },
          { label: 'Target Offer', value: '₹8.0 LPA (+45%)' },
          { label: 'Commute', value: '45 mins (Hybrid)' },
        ],
      },
    },
    {
      id: 'evidence',
      name: 'LIVE EVIDENCE',
      tag: 'Authoritative Registries & Benchmarks',
      desc: 'FEZI queries the Tamil Nadu Electronics & Software Wage Index (96% reliability), Numbeo Chennai Living Index, and NASSCOM reports.',
      icon: ShieldCheck,
      pill: '96% Benchmark Match',
      preview: {
        headline: 'Authoritative Sources',
        stats: [
          { label: 'TN IT Wage Corridor', value: '₹6.8L - ₹9.2L' },
          { label: 'Chennai Rent Index', value: '22% below BLR' },
          { label: 'Bonus Policy', value: 'Unstated Variable' },
        ],
      },
    },
    {
      id: 'scenarios',
      name: 'SCENARIOS',
      tag: 'Best, Expected, and Stressed Outliers',
      desc: 'Simulates compounding upside against downside risks: metro completion vs monsoon traffic; bonus realization vs promotion delay.',
      icon: Layers,
      pill: '3 Scenarios Modeled',
      preview: {
        headline: 'Simulation Spread',
        stats: [
          { label: 'Best Case', value: '86/100 (STRONG YES)' },
          { label: 'Expected Baseline', value: '78/100 (LEAN YES)' },
          { label: 'Worst Case', value: '59/100 (NEUTRAL)' },
        ],
      },
    },
    {
      id: 'weighting',
      name: 'WEIGHTED ANALYSIS',
      tag: 'Deterministic Priority Mathematics',
      desc: 'Combines user priorities with raw scores: Career Growth (30% × 85) + Salary (25% × 78) + Stability (15% × 82) + WLB (15% × 65).',
      icon: BarChart3,
      pill: 'Deterministic Calculation',
      preview: {
        headline: 'Calculated Contributions',
        stats: [
          { label: 'Growth (30%)', value: '+25.5 pts' },
          { label: 'Salary (25%)', value: '+19.5 pts' },
          { label: 'Stability (15%)', value: '+12.3 pts' },
        ],
      },
    },
    {
      id: 'score',
      name: 'FEZI SCORE',
      tag: '78 / 100 — LEAN YES (Medium Confidence)',
      desc: 'Deterministic sum produces an explainable verdict with clear boundary conditions: If salary drops below ₹7.2L, verdict changes to NEUTRAL.',
      icon: Sparkles,
      pill: 'Verdict Synthesized',
      preview: {
        headline: 'Verdict Synthesis',
        stats: [
          { label: 'FEZI Score', value: '78 / 100' },
          { label: 'Verdict', value: 'LEAN YES' },
          { label: 'Boundary Tipping Point', value: '< ₹7.2L → NEUTRAL' },
        ],
      },
    },
  ];

  return (
    <section className="bg-[#F5F5F2] text-[#090B0C] py-20 px-4 -mx-4 transition-colors">
      <div className="max-w-5xl mx-auto text-left">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#090B0C]/15 bg-white text-xs font-mono mb-4 text-[#090B0C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9E5F3]" />
            <span>Signature Architecture</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif text-[#090B0C] font-normal tracking-tight">
            How FEZI Reaches a Verdict
          </h2>
          <p className="text-sm text-[#090B0C]/60 mt-2 max-w-xl font-sans leading-relaxed">
            Information → Analysis → Decision. Each decision moves deterministically through 5 stages without generic generative guessing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: 5 Stage Navigation Ladder */}
          <div className="md:col-span-6 space-y-2.5 relative">
            <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-[#090B0C]/10 pointer-events-none" />

            {stages.map((stage, idx) => {
              const isActive = activeStage === idx;

              return (
                <div
                  key={stage.id}
                  onClick={() => setActiveStage(idx)}
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-4 border ${
                    isActive
                      ? 'bg-white border-[#090B0C] shadow-sm'
                      : 'bg-white/50 border-[#090B0C]/10 hover:border-[#090B0C]/25'
                  }`}
                >
                  {/* Number Badge */}
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#090B0C] text-[#F5F5F2]'
                        : 'bg-[#090B0C]/5 text-[#090B0C]/60'
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#090B0C]">
                        {stage.name}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#B9E5F3] text-[#090B0C] font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-serif text-[#090B0C] mt-0.5">
                      {stage.tag}
                    </div>
                    <p className="text-xs text-[#090B0C]/60 mt-1 line-clamp-2 leading-relaxed font-sans">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Stage Dossier Card */}
          <div className="md:col-span-6 sticky top-24">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#090B0C] text-[#F5F5F2] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#8E959E] uppercase">
                    Stage 0{activeStage + 1}
                  </span>
                  <h3 className="text-2xl font-serif font-normal text-[#F5F5F2]">
                    {stages[activeStage].name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border border-white/20 text-[#B9E5F3]">
                  {stages[activeStage].pill}
                </span>
              </div>

              <p className="text-xs text-[#8E959E] leading-relaxed mb-6 font-sans">
                {stages[activeStage].desc}
              </p>

              {/* Data Readout Matrix */}
              <div className="p-4 rounded-2xl bg-[#0F1214] border border-white/5 space-y-3">
                <div className="text-[10px] font-mono text-[#8E959E] uppercase tracking-wider">
                  {stages[activeStage].preview.headline}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {stages[activeStage].preview.stats.map((s, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#090B0C] border border-white/5">
                      <div className="text-[10px] font-mono text-[#8E959E]">{s.label}</div>
                      <div className="text-xs font-mono font-bold text-[#B9E5F3] mt-0.5 truncate">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 flex items-center justify-between text-xs font-mono text-[#8E959E]">
                <span>Phase {activeStage + 1} of 5</span>
                <div className="flex gap-1.5">
                  {stages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStage(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStage === i ? 'w-6 bg-[#B9E5F3]' : 'w-2 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
