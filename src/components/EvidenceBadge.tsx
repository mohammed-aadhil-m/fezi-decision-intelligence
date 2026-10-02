import React from 'react';
import { EvidenceType } from '../types/decision';

interface EvidenceBadgeProps {
  type: EvidenceType;
  showLabel?: boolean;
  className?: string;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  type,
  showLabel = true,
  className = '',
}) => {
  switch (type) {
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border border-[#B9E5F3]/40 text-[#B9E5F3] bg-[#B9E5F3]/5 ${className}`}
          title="Verified: Supported by an authoritative official source"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#B9E5F3] animate-pulse"></span>
          {showLabel && <span>VERIFIED</span>}
        </span>
      );
    case 'ESTIMATED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border border-current/20 text-[#8E959E] bg-white/5 ${className}`}
          title="Estimated: Modeled or calculated by FEZI decision engine"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
          {showLabel && <span>ESTIMATED</span>}
        </span>
      );
    case 'USER_PROVIDED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border border-current/20 text-[#8E959E] bg-white/5 ${className}`}
          title="User Provided: Self-reported candidate context"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
          {showLabel && <span>USER PROVIDED</span>}
        </span>
      );
    case 'UNKNOWN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border border-dashed border-current/40 text-[#8E959E] bg-white/5 ${className}`}
          title="Unknown: Information that could not be reliably verified"
        >
          <span className="w-1.5 h-1.5 rounded-full border border-current"></span>
          {showLabel && <span>UNKNOWN</span>}
        </span>
      );
  }
};
