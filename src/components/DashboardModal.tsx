import React from 'react';
import { DecisionReport } from '../types/decision';
import { X, Calendar, ArrowRight, Trash2, Plus } from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionReport[];
  onSelectDecision: (report: DecisionReport) => void;
  onNewDecision: () => void;
  onDeleteDecision: (id: string, e: React.MouseEvent) => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onNewDecision,
  onDeleteDecision,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#0F1214] border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col font-sans text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase mb-0.5 block">
              Dossier Archive
            </span>
            <h3 className="text-2xl font-serif text-[#F5F5F2] font-normal">
              My Decisions
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNewDecision();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#B9E5F3] hover:bg-[#a6dcf0] text-[#090B0C] font-semibold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Decision</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8E959E] hover:text-[#F5F5F2] hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-12 text-[#8E959E] font-mono text-xs">
              No saved decisions yet.
            </div>
          ) : (
            savedDecisions.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectDecision(item);
                  onClose();
                }}
                className="group relative p-4 rounded-2xl bg-[#090B0C] hover:bg-[#090B0C]/80 border border-white/5 hover:border-white/20 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono uppercase border border-white/10 text-[#8E959E]">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#8E959E] flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-serif text-[#F5F5F2] group-hover:text-[#B9E5F3] transition truncate">
                    "{item.title}"
                  </h4>

                  <p className="text-xs text-[#8E959E] mt-0.5 line-clamp-1 font-sans">
                    {item.whyRecommended[0] || item.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl font-serif text-[#B9E5F3]">
                        {item.score}
                      </span>
                      <span className="text-xs text-[#8E959E] font-mono">/100</span>
                    </div>
                    <span className="inline-block px-2 py-0.2 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider border border-white/15 text-[#F5F5F2]">
                      {item.verdict}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => onDeleteDecision(item.id, e)}
                      className="p-2 rounded-lg text-[#8E959E] hover:text-[#F5F5F2] hover:bg-white/5 transition"
                      title="Delete decision"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 rounded-lg text-[#8E959E] group-hover:text-[#B9E5F3] transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
