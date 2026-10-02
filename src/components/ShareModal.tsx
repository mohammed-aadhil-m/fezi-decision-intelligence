import React, { useState } from 'react';
import { DecisionReport } from '../types/decision';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  report: DecisionReport;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ report, isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/#report-${report.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMarkdown = () => {
    const md = `### FEZI Decision Report
Decision: ${report.title}
FEZI Score: ${report.score} / 100
Recommendation: ${report.verdict}
Confidence: ${report.confidence}

Why FEZI recommends this:
${report.whyRecommended.map((r) => `- ${r}`).join('\n')}

Key Evidence:
${report.evidence.slice(0, 3).map((e) => `- [${e.type}] ${e.statement}`).join('\n')}

Decide with Evidence — FEZI AI Decision Intelligence`;

    navigator.clipboard.writeText(md);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0F1214] border border-white/10 shadow-2xl p-6 sm:p-8 font-sans text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#8E959E] hover:text-[#F5F5F2] hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#B9E5F3] uppercase mb-1">
          <Share2 className="w-3.5 h-3.5" />
          <span>Shareable Artifact</span>
        </div>
        <h3 className="text-2xl font-serif text-[#F5F5F2] font-normal mb-5">
          Decision Dossier Card
        </h3>

        {/* Shareable Card Preview */}
        <div className="rounded-2xl bg-[#090B0C] p-6 border border-white/15 shadow-2xl mb-6 select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <img
                src="/fezi-icon.png"
                alt="FEZI"
                className="w-6 h-6 object-contain filter drop-shadow-[0_2px_8px_rgba(185,229,243,0.3)]"
              />
              <span className="text-sm font-serif text-[#F5F5F2]">FEZI</span>
            </div>
            <span className="text-[10px] font-mono text-[#8E959E] uppercase tracking-wider">
              Decide with Evidence
            </span>
          </div>

          <div className="text-base font-serif text-[#F5F5F2] leading-snug mb-4">
            "{report.title}"
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F1214] border border-white/5 mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#8E959E]">FEZI Score</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif text-[#B9E5F3]">
                  {report.score}
                </span>
                <span className="text-xs text-[#8E959E] font-mono">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-[#8E959E]">Recommendation</div>
              <div className="text-sm font-mono font-bold uppercase text-[#F5F5F2] border border-white/20 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                {report.verdict}
              </div>
              <div className="text-[10px] font-mono text-[#8E959E] mt-1">
                Confidence: <strong className="text-[#F5F5F2]">{report.confidence}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mb-4 text-xs text-[#8E959E]">
            {report.whyRecommended.slice(0, 2).map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#B9E5F3]">•</span>
                <span className="line-clamp-1">{r}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-[#8E959E]">
            <span>Deterministic Scoring Model</span>
            <span>fezi.ai</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B9E5F3] hover:bg-[#a6dcf0] text-[#090B0C] font-semibold text-xs transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[#F5F5F2] border border-white/20 font-medium text-xs transition font-mono"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied Markdown' : 'Copy Summary'}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#8E959E] text-center font-mono">
          Reports are private. Only candidates with this unique link can inspect this record.
        </p>
      </div>
    </div>
  );
};
