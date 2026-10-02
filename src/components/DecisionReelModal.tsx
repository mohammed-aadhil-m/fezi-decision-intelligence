import React, { useState, useEffect } from 'react';
import { DecisionReport } from '../types/decision';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface DecisionReelModalProps {
  report: DecisionReport;
  isOpen: boolean;
  onClose: () => void;
}

export const DecisionReelModal: React.FC<DecisionReelModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const totalDuration = 60;

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 0.5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen]);

  if (!isOpen) return null;

  let activePhase = '01. THE DECISION';
  let phaseDescription = 'Setting up decision context and real-world stakes';

  if (currentTime < 3) {
    activePhase = '01. THE DECISION';
    phaseDescription = 'Setting up decision context and real-world stakes';
  } else if (currentTime < 8) {
    activePhase = '02. THE QUESTION';
    phaseDescription = 'The core fork in the road';
  } else if (currentTime < 18) {
    activePhase = '03. KEY FACTORS';
    phaseDescription = 'Weighted criteria: Salary, Growth, Stability, Commute';
  } else if (currentTime < 30) {
    activePhase = '04. ADVANTAGES';
    phaseDescription = 'Evidence-backed asymmetric upside';
  } else if (currentTime < 40) {
    activePhase = '05. RISKS & UNKNOWNS';
    phaseDescription = 'Quantified downside and mitigation barriers';
  } else if (currentTime < 50) {
    activePhase = '06. FEZI SCORE';
    phaseDescription = 'Deterministic 0-100 weighted calculation';
  } else {
    activePhase = '07. VERDICT';
    phaseDescription = 'Final explainable intelligence verdict';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#0F1214] border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 font-sans text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-xl text-[#8E959E] hover:text-[#F5F5F2] hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 9:16 Vertical Video Frame */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative w-[280px] sm:w-[310px] aspect-[9/16] rounded-3xl bg-[#090B0C] border border-white/15 shadow-2xl overflow-hidden flex flex-col justify-between p-5 text-[#F5F5F2] select-none">
            {/* Top Reel Navigation Bar */}
            <div className="relative z-10">
              <div className="flex gap-1 mb-3">
                {[3, 5, 10, 12, 10, 10, 10].map((duration, i) => {
                  const phaseStart = [0, 3, 8, 18, 30, 40, 50][i];
                  const phaseEnd = phaseStart + duration;
                  const isCompleted = currentTime >= phaseEnd;
                  const isActive = currentTime >= phaseStart && currentTime < phaseEnd;
                  const progressRatio = isActive ? (currentTime - phaseStart) / duration : isCompleted ? 1 : 0;

                  return (
                    <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B9E5F3] transition-all duration-300"
                        style={{ width: `${progressRatio * 100}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#B9E5F3]">
                  FEZI Reel
                </span>
                <span className="text-[10px] font-mono text-[#8E959E]">
                  60s Intelligence
                </span>
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="relative z-10 my-auto text-center px-2 py-4">
              {currentTime < 3 && (
                <div className="space-y-3">
                  <img
                    src="/fezi-icon.png"
                    alt="FEZI"
                    className="w-12 h-12 mx-auto object-contain filter drop-shadow-[0_4px_14px_rgba(185,229,243,0.4)] animate-pulse"
                  />
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#B9E5F3]">
                    AI Decision Intelligence
                  </div>
                  <h2 className="text-3xl font-serif text-[#F5F5F2] font-normal">FEZI REPORT</h2>
                  <p className="text-xs text-[#8E959E]">Decide with evidence.</p>
                </div>
              )}

              {currentTime >= 3 && currentTime < 8 && (
                <div className="space-y-4">
                  <div className="text-[10px] font-mono uppercase text-[#B9E5F3] tracking-wider">The Dilemma</div>
                  <h3 className="text-xl font-serif text-[#F5F5F2] leading-snug">
                    "{report.title}"
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full text-[10px] border border-white/15 text-[#8E959E] font-mono">
                    Category: {report.category.toUpperCase()}
                  </div>
                </div>
              )}

              {currentTime >= 8 && currentTime < 18 && (
                <div className="space-y-2.5 text-left">
                  <div className="text-center text-[10px] font-mono uppercase text-[#B9E5F3] tracking-wider mb-2">
                    Key Decision Factors
                  </div>
                  {report.factors.slice(0, 4).map((f) => (
                    <div key={f.id} className="p-2.5 rounded-xl bg-[#0F1214] border border-white/5">
                      <div className="flex justify-between text-xs mb-1 font-sans">
                        <span>{f.name}</span>
                        <span className="font-mono text-[#B9E5F3]">+{f.weightedContribution}</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#B9E5F3]" style={{ width: `${f.rawScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentTime >= 18 && currentTime < 30 && (
                <div className="space-y-2.5 text-left">
                  <div className="text-center text-[10px] font-mono uppercase text-[#B9E5F3] tracking-wider mb-2">
                    Verified Advantages
                  </div>
                  {report.biggestAdvantages.slice(0, 3).map((adv, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#0F1214] border border-white/5 text-xs text-[#F5F5F2]">
                      <span className="text-[#B9E5F3] font-mono">0{i + 1}.</span>
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              )}

              {currentTime >= 30 && currentTime < 40 && (
                <div className="space-y-2.5 text-left">
                  <div className="text-center text-[10px] font-mono uppercase text-[#8E959E] tracking-wider mb-2">
                    Risks & Unknowns
                  </div>
                  {report.biggestRisks.slice(0, 2).map((risk, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#0F1214] border border-white/5 text-xs text-[#8E959E]">
                      • {risk}
                    </div>
                  ))}
                  <div className="p-2.5 rounded-xl bg-[#0F1214] border border-dashed border-white/15 text-[10px] text-[#8E959E] font-mono">
                    UNKNOWN: {report.unknowns[0] || 'Unverified bonus rate'}
                  </div>
                </div>
              )}

              {currentTime >= 40 && currentTime < 50 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#B9E5F3] tracking-wider">
                    Deterministic Score
                  </div>
                  <div className="text-6xl font-serif text-[#B9E5F3]">
                    {report.score}
                  </div>
                  <div className="text-xs font-mono text-[#8E959E]">OUT OF 100</div>
                  <div className="text-[11px] text-[#8E959E] pt-2">
                    Calculated from weighted priorities & verified evidence
                  </div>
                </div>
              )}

              {currentTime >= 50 && (
                <div className="space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E959E]">
                    Official Recommendation
                  </div>
                  <div className="inline-block px-5 py-2 rounded-full text-base font-mono font-bold uppercase tracking-wider border border-white/20 text-[#F5F5F2]">
                    {report.verdict}
                  </div>
                  <div className="text-xs text-[#8E959E] font-mono">
                    Confidence: <strong>{report.confidence}</strong>
                  </div>
                  <p className="text-[11px] text-[#8E959E] pt-2">
                    Decide with Evidence. Powered by FEZI.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Timeline */}
            <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#8E959E]">
              <span>fezi.ai</span>
              <span>{Math.floor(currentTime)}s / {totalDuration}s</span>
            </div>
          </div>
        </div>

        {/* Right Side: Player Controls */}
        <div className="flex-1 flex flex-col justify-between py-2 text-left">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
              Phase 02 Architecture
            </span>
            <h3 className="text-2xl font-serif text-[#F5F5F2] font-normal mt-1 mb-2">
              Vertical Decision Reel (9:16)
            </h3>
            <p className="text-xs text-[#8E959E] mb-6 leading-relaxed">
              Programmatic 60-second video template structured for mobile advisory sharing.
            </p>

            <div className="p-4 rounded-2xl bg-[#090B0C] border border-white/10 mb-6">
              <div className="text-[10px] font-mono text-[#8E959E] uppercase mb-1">Active Scene</div>
              <div className="text-sm font-semibold text-[#F5F5F2]">{activePhase}</div>
              <p className="text-xs text-[#8E959E] mt-0.5">{phaseDescription}</p>

              <div className="mt-4">
                <input
                  type="range"
                  min={0}
                  max={totalDuration}
                  step={0.5}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#B9E5F3]"
                />
              </div>
            </div>

            <div className="space-y-1.5 mb-6 text-xs font-mono">
              {[
                { time: '0–3s', label: 'THE DECISION' },
                { time: '3–8s', label: 'THE QUESTION' },
                { time: '8–18s', label: 'KEY FACTORS' },
                { time: '18–30s', label: 'ADVANTAGES' },
                { time: '30–40s', label: 'RISKS' },
                { time: '40–50s', label: 'FEZI SCORE' },
                { time: '50–60s', label: 'VERDICT' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentTime([0, 3, 8, 18, 30, 40, 50][idx])}
                  className={`p-2 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    activePhase.includes(step.label)
                      ? 'bg-white/10 text-[#F5F5F2]'
                      : 'text-[#8E959E] hover:text-[#F5F5F2]'
                  }`}
                >
                  <span className="font-bold">{step.time} — {step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B9E5F3] hover:bg-[#a6dcf0] text-[#090B0C] font-semibold text-xs transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-2.5 rounded-xl border border-white/15 text-[#8E959E] hover:text-[#F5F5F2] hover:bg-white/5 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
