import React from 'react';
import { VerdictType } from '../types/decision';

interface ScoreGaugeProps {
  score: number;
  verdict: VerdictType;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, verdict, size = 180 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 260 degree arc
  const arcLength = circumference * (260 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size * 0.9 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-[220deg]"
        >
          {/* Background track (monochrome) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(245, 245, 242, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active progress arc (Ice Blue #B9E5F3 signal) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#B9E5F3"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: 'drop-shadow(0 0 8px rgba(185, 229, 243, 0.35))',
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-[10px] uppercase tracking-widest text-[#8E959E] font-mono">FEZI Score</span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-4xl sm:text-5xl font-serif text-[#B9E5F3] tracking-tight">
              {score}
            </span>
            <span className="text-[#8E959E] text-sm font-mono">/100</span>
          </div>
        </div>
      </div>

      {/* Verdict Pill (Monochrome with Ice Blue precision dot) */}
      <div className="mt-1 px-4 py-1.5 rounded-full border border-white/15 bg-[#090B0C] text-xs font-mono tracking-wider uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B9E5F3]" />
        <span className="text-[#F5F5F2] font-semibold">{verdict}</span>
      </div>

      {/* Threshold Guide (Strict Monochrome) */}
      <div className="mt-3 flex items-center gap-3 text-[10px] text-[#8E959E] font-mono">
        <span className={score < 40 ? 'text-[#B9E5F3] font-bold' : ''}>0–39 No</span>
        <span>•</span>
        <span className={score >= 40 && score < 60 ? 'text-[#B9E5F3] font-bold' : ''}>40–59 Neutral</span>
        <span>•</span>
        <span className={score >= 60 && score < 80 ? 'text-[#B9E5F3] font-bold' : ''}>60–79 Lean Yes</span>
        <span>•</span>
        <span className={score >= 80 ? 'text-[#B9E5F3] font-bold' : ''}>80+ Strong Yes</span>
      </div>
    </div>
  );
};
