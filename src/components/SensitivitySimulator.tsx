import React, { useState } from 'react';
import { SensitivityVariable, VerdictType } from '../types/decision';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface SensitivitySimulatorProps {
  baselineScore: number;
  baselineVerdict: VerdictType;
  sensitivityVariables: SensitivityVariable[];
  offeredSalary?: number;
  commuteMinutes?: number;
}

export const SensitivitySimulator: React.FC<SensitivitySimulatorProps> = ({
  baselineScore,
  baselineVerdict,
  sensitivityVariables,
  offeredSalary = 8.0,
  commuteMinutes = 45,
}) => {
  const [salaryOverride, setSalaryOverride] = useState<number>(offeredSalary);
  const [commuteOverride, setCommuteOverride] = useState<number>(commuteMinutes);
  const [isRemoteOverride, setIsRemoteOverride] = useState<boolean>(false);
  const [hasRetentionBonus, setHasRetentionBonus] = useState<boolean>(false);

  let simulatedScore = baselineScore;

  const salaryDelta = salaryOverride - offeredSalary;
  simulatedScore += Math.round(salaryDelta * 8.5);

  const commuteDelta = commuteOverride - commuteMinutes;
  simulatedScore -= Math.round((commuteDelta / 15) * 4);

  if (isRemoteOverride) simulatedScore += 8;
  if (hasRetentionBonus) simulatedScore += 5;

  simulatedScore = Math.max(10, Math.min(99, simulatedScore));

  let simulatedVerdict: VerdictType = 'LEAN YES';
  if (simulatedScore >= 80) simulatedVerdict = 'STRONG YES';
  else if (simulatedScore >= 60) simulatedVerdict = 'LEAN YES';
  else if (simulatedScore >= 40) simulatedVerdict = 'NEUTRAL';
  else simulatedVerdict = 'LEAN NO';

  const isVerdictChanged = simulatedVerdict !== baselineVerdict;

  const resetSimulation = () => {
    setSalaryOverride(offeredSalary);
    setCommuteOverride(commuteMinutes);
    setIsRemoteOverride(false);
    setHasRetentionBonus(false);
  };

  return (
    <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
            Sensitivity Engine
          </span>
          <h3 className="text-2xl font-serif text-[#F5F5F2] mt-0.5 font-normal">
            What Could Change the Recommendation?
          </h3>
          <p className="text-xs text-[#8E959E]">
            Test how shifts in offer parameters or constraints alter the mathematical verdict.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-[#8E959E] hover:text-[#F5F5F2] border border-white/10 hover:border-white/25 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Live Simulation Banner */}
      <div
        className={`p-5 rounded-2xl border mb-6 transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 ${
          isVerdictChanged
            ? 'bg-[#090B0C] border-[#B9E5F3]'
            : 'bg-[#090B0C] border-white/10'
        }`}
      >
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] uppercase font-mono text-[#8E959E]">Simulated Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif text-[#B9E5F3]">
                {simulatedScore}
              </span>
              <span className="text-xs text-[#8E959E] font-mono">
                ({simulatedScore >= baselineScore ? `+${simulatedScore - baselineScore}` : `${simulatedScore - baselineScore}`} vs baseline)
              </span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-[#8E959E] hidden sm:block" />

          <div>
            <div className="text-[10px] uppercase font-mono text-[#8E959E]">Simulated Verdict</div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-medium uppercase tracking-wider border border-white/20 text-[#F5F5F2] mt-0.5">
              {simulatedVerdict}
            </span>
          </div>
        </div>

        {isVerdictChanged ? (
          <div className="text-xs font-mono text-[#F5F5F2] border border-white/20 px-3.5 py-2 rounded-xl bg-white/5">
            Boundary shift: Recommendation flipped from <strong className="underline">{baselineVerdict}</strong> to{' '}
            <strong className="underline text-[#B9E5F3]">{simulatedVerdict}</strong>
          </div>
        ) : (
          <div className="text-xs font-mono text-[#8E959E]">
            Verdict remains stable under current conditions.
          </div>
        )}
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Salary Slider */}
        <div className="bg-[#090B0C] p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-[#F5F5F2]">Offered Salary</span>
            <span className="text-sm font-mono text-[#B9E5F3]">₹{salaryOverride.toFixed(1)} LPA</span>
          </div>
          <input
            type="range"
            min={5.0}
            max={12.0}
            step={0.1}
            value={salaryOverride}
            onChange={(e) => setSalaryOverride(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#B9E5F3]"
          />
          <div className="flex justify-between text-[10px] text-[#8E959E] font-mono mt-1.5">
            <span>₹5.0L Baseline</span>
            <span className="text-[#F5F5F2] border-b border-[#B9E5F3]">₹7.2L Tipping Point</span>
            <span>₹12.0L Cap</span>
          </div>
        </div>

        {/* Commute Slider */}
        <div className="bg-[#090B0C] p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-[#F5F5F2]">One-way Commute</span>
            <span className="text-sm font-mono text-[#B9E5F3]">{commuteOverride} mins</span>
          </div>
          <input
            type="range"
            min={15}
            max={120}
            step={5}
            value={commuteOverride}
            onChange={(e) => setCommuteOverride(parseInt(e.target.value))}
            className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#B9E5F3]"
          />
          <div className="flex justify-between text-[10px] text-[#8E959E] font-mono mt-1.5">
            <span>15 mins</span>
            <span>45 mins (Baseline)</span>
            <span className="text-[#F5F5F2] border-b border-[#B9E5F3]">85m Ceiling</span>
          </div>
        </div>

        {/* Remote Toggle */}
        <div className="bg-[#090B0C] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#F5F5F2]">100% Full Remote Option</div>
            <div className="text-[11px] text-[#8E959E]">Removes transit overhead entirely</div>
          </div>
          <button
            onClick={() => setIsRemoteOverride(!isRemoteOverride)}
            className={`px-3 py-1 rounded-xl text-xs font-mono transition ${
              isRemoteOverride
                ? 'bg-[#B9E5F3] text-[#090B0C] font-semibold'
                : 'bg-transparent text-[#8E959E] border border-white/15 hover:border-white/30'
            }`}
          >
            {isRemoteOverride ? 'ACTIVE (+8 pts)' : 'OFF'}
          </button>
        </div>

        {/* Retention Bonus Toggle */}
        <div className="bg-[#090B0C] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#F5F5F2]">₹1.5L Joining Bonus</div>
            <div className="text-[11px] text-[#8E959E]">De-risks relocation expenses</div>
          </div>
          <button
            onClick={() => setHasRetentionBonus(!hasRetentionBonus)}
            className={`px-3 py-1 rounded-xl text-xs font-mono transition ${
              hasRetentionBonus
                ? 'bg-[#B9E5F3] text-[#090B0C] font-semibold'
                : 'bg-transparent text-[#8E959E] border border-white/15 hover:border-white/30'
            }`}
          >
            {hasRetentionBonus ? 'ACTIVE (+5 pts)' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Pre-calculated Sensitivity Boundaries */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E959E] mb-3">
          Identified Tipping Boundaries
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sensitivityVariables.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#090B0C] border border-white/5 text-left"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#F5F5F2]">{item.variable}</span>
                <span className="text-[10px] font-mono border border-white/15 text-[#8E959E] px-2 py-0.5 rounded-full">
                  {item.sensitivity}
                </span>
              </div>
              <div className="text-xs font-mono text-[#B9E5F3] mb-1">{item.thresholdCondition}</div>
              <p className="text-[11px] text-[#8E959E] leading-relaxed">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
