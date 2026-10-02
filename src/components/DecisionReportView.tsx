import React, { useState } from 'react';
import { DecisionReport, EvidenceType } from '../types/decision';
import { ScoreGauge } from './ScoreGauge';
import { EvidenceBadge } from './EvidenceBadge';
import { SensitivitySimulator } from './SensitivitySimulator';
import {
  Share2,
  Film,
  RefreshCw,
  ExternalLink,
  Calendar,
} from 'lucide-react';

interface DecisionReportViewProps {
  report: DecisionReport;
  onShare: () => void;
  onOpenReel: () => void;
  onEditContext: () => void;
}

export const DecisionReportView: React.FC<DecisionReportViewProps> = ({
  report,
  onShare,
  onOpenReel,
  onEditContext,
}) => {
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceType | 'ALL'>('ALL');
  const [activeScenarioTab, setActiveScenarioTab] = useState<'EXPECTED_CASE' | 'BEST_CASE' | 'WORST_CASE'>('EXPECTED_CASE');
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);

  const filteredEvidence = report.evidence.filter((e) => {
    if (evidenceFilter === 'ALL') return true;
    return e.type === evidenceFilter;
  });

  const verifiedCount = report.evidence.filter((e) => e.type === 'VERIFIED').length;
  const estimatedCount = report.evidence.filter((e) => e.type === 'ESTIMATED').length;
  const userCount = report.evidence.filter((e) => e.type === 'USER_PROVIDED').length;
  const unknownCount = report.evidence.filter((e) => e.type === 'UNKNOWN').length;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 text-left space-y-10 font-sans selection:bg-[#B9E5F3] selection:text-[#090B0C]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono uppercase border border-white/15 text-[#8E959E]">
              FEZI DECISION REPORT
            </span>
            <span className="text-xs font-mono text-[#8E959E] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#F5F5F2] tracking-tight font-normal">
            "{report.title}"
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Primary CTA */}
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B9E5F3] hover:bg-[#a6dcf0] text-[#090B0C] font-semibold text-xs transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Decision</span>
          </button>

          {/* Secondary CTAs */}
          <button
            onClick={onOpenReel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[#F5F5F2] border border-white/20 text-xs font-medium transition"
          >
            <Film className="w-4 h-4 text-[#B9E5F3]" />
            <span>Decision Reel</span>
          </button>

          <button
            onClick={onEditContext}
            className="p-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[#8E959E] hover:text-[#F5F5F2] border border-white/15 transition"
            title="Edit context parameters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Decision Core: Score + Executive Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Score Gauge */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col items-center justify-center relative">
          <ScoreGauge score={report.score} verdict={report.verdict} size={210} />

          <div className="mt-4 pt-4 border-t border-white/10 w-full flex items-center justify-between">
            <div className="text-xs text-[#8E959E] flex items-center gap-3 font-mono flex-wrap">
              <div className="flex items-center gap-1.5">
                <span>Confidence:</span>
                <span className="font-bold border border-white/20 px-2 py-0.5 rounded-full text-[#F5F5F2]">
                  {report.confidence} ({report.confidenceScore}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Evidence Coverage:</span>
                <span className="font-bold border border-[#B9E5F3]/30 px-2 py-0.5 rounded-full text-[#B9E5F3]">
                  {report.evidenceCoverage || 75}%
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
              className="text-[11px] font-mono text-[#B9E5F3] hover:underline"
            >
              Methodology →
            </button>
          </div>

          {showConfidenceDetails && (
            <div className="mt-3 p-3.5 rounded-xl bg-[#090B0C] border border-white/10 text-xs text-[#8E959E] space-y-1.5 w-full">
              <div className="font-semibold text-[#F5F5F2]">Confidence Formulation:</div>
              {report.confidenceReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-[#B9E5F3]">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Why FEZI Recommends This */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
              Executive Synthesis
            </span>
            <h2 className="text-2xl font-serif text-[#F5F5F2] mt-1 mb-3 font-normal">
              Why FEZI Recommends This
            </h2>
            <p className="text-sm text-[#8E959E] leading-relaxed mb-6 font-sans">
              {report.summary}
            </p>

            <div className="space-y-2.5">
              {report.whyRecommended.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-[#090B0C] border border-white/5 text-xs text-[#F5F5F2]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B9E5F3] shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 text-[11px] font-mono text-[#8E959E] flex items-center justify-between">
            <span>Deterministic mathematical model</span>
            <span>Category: {report.category.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Advantages vs Risks (Monochrome Editorial Split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biggest Advantages */}
        <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-xl">
          <div className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase mb-1">
            Asymmetric Upside
          </div>
          <h3 className="text-xl font-serif text-[#F5F5F2] mb-4 font-normal">
            Biggest Advantages
          </h3>

          <div className="space-y-3">
            {report.biggestAdvantages.map((adv, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#090B0C] border border-white/5 text-xs text-[#F5F5F2] leading-relaxed flex items-start gap-2.5"
              >
                <span className="font-mono text-[#B9E5F3]">0{idx + 1}.</span>
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Biggest Risks */}
        <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-xl">
          <div className="text-xs font-mono tracking-widest text-[#8E959E] uppercase mb-1">
            Downside Vulnerabilities
          </div>
          <h3 className="text-xl font-serif text-[#F5F5F2] mb-4 font-normal">
            Biggest Risks & Pitfalls
          </h3>

          <div className="space-y-3">
            {report.biggestRisks.map((risk, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#090B0C] border border-white/5 text-xs text-[#8E959E] leading-relaxed flex items-start gap-2.5"
              >
                <span className="font-mono text-[#8E959E]">0{idx + 1}.</span>
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deterministic Factor Scoring Breakdown */}
      <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
              Calculation Ledger
            </span>
            <h3 className="text-2xl font-serif text-[#F5F5F2] mt-0.5 font-normal">
              Weighted Criteria Breakdown
            </h3>
            <p className="text-xs text-[#8E959E]">
              Score = Sum(Weight% × Factor Score). Deterministic arithmetic.
            </p>
          </div>

          <div className="flex items-center gap-2 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-mono text-[#F5F5F2]">
            <span>Total:</span>
            <strong className="text-[#B9E5F3] font-bold">{report.score} / 100</strong>
          </div>
        </div>

        <div className="space-y-4">
          {report.factors.map((factor) => (
            <div
              key={factor.id}
              className="p-4 rounded-2xl bg-[#090B0C] border border-white/5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-[#F5F5F2]">{factor.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/10 text-[#8E959E]">
                    {factor.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[#8E959E]">
                    Weight: <strong className="text-[#F5F5F2]">{factor.weight}%</strong>
                  </span>
                  <span className="text-[#8E959E]">
                    Raw: <strong className="text-[#F5F5F2]">{factor.rawScore}/100</strong>
                  </span>
                  <span className="text-[#B9E5F3] font-bold">
                    +{factor.weightedContribution} pts
                  </span>
                </div>
              </div>

              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="h-full bg-[#B9E5F3] rounded-full"
                  style={{ width: `${factor.rawScore}%` }}
                />
              </div>

              <p className="text-xs text-[#8E959E] leading-relaxed">{factor.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Analysis */}
      <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl">
        <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
          Simulation
        </span>
        <h3 className="text-2xl font-serif text-[#F5F5F2] mt-0.5 mb-2 font-normal">
          Multi-Scenario Analysis
        </h3>
        <p className="text-xs text-[#8E959E] mb-6">
          How the decision holds up under optimal, baseline, and stressed conditions.
        </p>

        <div className="flex gap-2 p-1 rounded-2xl border border-white/10 bg-[#090B0C] mb-6 max-w-md">
          {report.scenarios.map((sc) => {
            const isActive = activeScenarioTab === sc.type;
            return (
              <button
                key={sc.type}
                onClick={() => setActiveScenarioTab(sc.type)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-[#B9E5F3] text-[#090B0C] font-semibold'
                    : 'text-[#8E959E] hover:text-[#F5F5F2]'
                }`}
              >
                <span>{sc.label}</span>
                <span className="text-[11px] opacity-80">({sc.score})</span>
              </button>
            );
          })}
        </div>

        {(() => {
          const current = report.scenarios.find((s) => s.type === activeScenarioTab) || report.scenarios[0];
          return (
            <div className="p-5 rounded-2xl bg-[#090B0C] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-serif text-[#B9E5F3]">{current.score} / 100</span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-mono border border-white/15 text-[#F5F5F2]">
                    {current.verdict}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#8E959E]">
                  {current.label} Model
                </span>
              </div>

              <p className="text-xs text-[#F5F5F2] mb-4 leading-relaxed">{current.summary}</p>

              <div>
                <h4 className="text-[11px] font-mono uppercase text-[#8E959E] mb-2">Underlying Assumptions:</h4>
                <div className="space-y-1.5">
                  {current.assumptions.map((asm, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#8E959E]">
                      <span className="text-[#B9E5F3]">•</span>
                      <span>{asm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Interactive Sensitivity Simulator */}
      <SensitivitySimulator
        baselineScore={report.score}
        baselineVerdict={report.verdict}
        sensitivityVariables={report.sensitivity}
        offeredSalary={report.userContext.offeredSalary || 8.0}
        commuteMinutes={report.userContext.commuteMinutes || 45}
      />

      {/* What Could Change This Recommendation? (Section 21) */}
      {report.whatCouldChange && report.whatCouldChange.length > 0 && (
        <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#B9E5F3]"></span>
            <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
              Tipping Points & Sensitivity
            </span>
          </div>
          <h3 className="text-2xl font-serif text-[#F5F5F2] font-normal mb-3">
            What could change this recommendation?
          </h3>
          <p className="text-xs text-[#8E959E] mb-5">
            FEZI dynamically identifies the parameter boundaries where the balance of evidence flips the verdict.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.whatCouldChange.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#090B0C] border border-white/10 flex items-start gap-3"
              >
                <span className="text-xs font-mono text-[#B9E5F3] font-bold shrink-0">{idx + 1}.</span>
                <span className="text-xs text-[#F5F5F2] leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assumptions Transparency Card (Section 18) */}
      {report.assumptions && report.assumptions.length > 0 && (
        <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl">
          <span className="text-xs font-mono tracking-widest text-[#8E959E] uppercase">
            Model Assumptions
          </span>
          <h3 className="text-2xl font-serif text-[#F5F5F2] font-normal mt-0.5 mb-2">
            Explicit Assumptions
          </h3>
          <p className="text-xs text-[#8E959E] mb-5">
            Every critical baseline premise used in this calculation is displayed below for full auditability.
          </p>
          <div className="space-y-2">
            {report.assumptions.map((asm, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#090B0C] border border-white/5 flex items-start gap-2.5 text-xs text-[#8E959E]"
              >
                <span className="text-[#B9E5F3] shrink-0 font-mono">•</span>
                <span className="leading-relaxed">{asm}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Option Comparison Matrix */}
      {report.comparison && (
        <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl">
          <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
            Comparative Matrix
          </span>
          <h3 className="text-2xl font-serif text-[#F5F5F2] mt-0.5 mb-2 font-normal">
            {report.comparison.optionAName} vs {report.comparison.optionBName}
          </h3>
          <p className="text-xs text-[#8E959E] mb-6">{report.comparison.tradeoffSummary}</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#8E959E] font-mono">
                  <th className="pb-3 font-semibold">Evaluation Factor</th>
                  <th className="pb-3 font-semibold text-[#B9E5F3]">
                    Option A ({report.comparison.optionAScore})
                  </th>
                  <th className="pb-3 font-semibold text-[#F5F5F2]">
                    Option B ({report.comparison.optionBScore})
                  </th>
                  <th className="pb-3 font-semibold text-right">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report.comparison.factors.map((f, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 font-medium text-[#F5F5F2]">{f.name}</td>
                    <td className="py-3">
                      <div className="font-mono text-[#B9E5F3]">{f.scoreA}/100</div>
                      {f.valueA && <div className="text-[11px] text-[#8E959E]">{f.valueA}</div>}
                    </td>
                    <td className="py-3">
                      <div className="font-mono text-[#8E959E]">{f.scoreB}/100</div>
                      {f.valueB && <div className="text-[11px] text-[#8E959E]">{f.valueB}</div>}
                    </td>
                    <td className="py-3 text-right">
                      {f.scoreA > f.scoreB ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-[#B9E5F3]/30 text-[#B9E5F3]">
                          +{(f.scoreA - f.scoreB)} pts Option A
                        </span>
                      ) : f.scoreB > f.scoreA ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-white/15 text-[#8E959E]">
                          +{(f.scoreB - f.scoreA)} pts Option B
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#8E959E]">Tied</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evidence Ledger */}
      <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
              Audit Ledger
            </span>
            <h3 className="text-2xl font-serif text-[#F5F5F2] mt-0.5 font-normal">
              Classified Evidence
            </h3>
            <p className="text-xs text-[#8E959E]">
              Zero invented citations. Every statement is strictly classified by authority.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#090B0C] border border-white/10">
            <button
              onClick={() => setEvidenceFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                evidenceFilter === 'ALL'
                  ? 'bg-white/15 text-[#F5F5F2]'
                  : 'text-[#8E959E] hover:text-[#F5F5F2]'
              }`}
            >
              All ({report.evidence.length})
            </button>
            <button
              onClick={() => setEvidenceFilter('VERIFIED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                evidenceFilter === 'VERIFIED'
                  ? 'border border-[#B9E5F3]/40 text-[#B9E5F3]'
                  : 'text-[#8E959E] hover:text-[#F5F5F2]'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setEvidenceFilter('ESTIMATED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                evidenceFilter === 'ESTIMATED'
                  ? 'border border-white/20 text-[#F5F5F2]'
                  : 'text-[#8E959E] hover:text-[#F5F5F2]'
              }`}
            >
              Estimated ({estimatedCount})
            </button>
            <button
              onClick={() => setEvidenceFilter('USER_PROVIDED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                evidenceFilter === 'USER_PROVIDED'
                  ? 'border border-white/20 text-[#F5F5F2]'
                  : 'text-[#8E959E] hover:text-[#F5F5F2]'
              }`}
            >
              User ({userCount})
            </button>
            <button
              onClick={() => setEvidenceFilter('UNKNOWN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                evidenceFilter === 'UNKNOWN'
                  ? 'border border-dashed border-white/30 text-[#F5F5F2]'
                  : 'text-[#8E959E] hover:text-[#F5F5F2]'
              }`}
            >
              Unknown ({unknownCount})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-[#090B0C] border border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <EvidenceBadge type={ev.type} />
                  {ev.sourceName && (
                    <span className="text-[11px] font-mono text-[#8E959E]">
                      via <strong className="text-[#F5F5F2]">{ev.sourceName}</strong>
                    </span>
                  )}
                  {ev.dateVerified && (
                    <span className="text-[10px] font-mono text-[#8E959E]/60">
                      • {ev.dateVerified}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#F5F5F2] leading-relaxed">
                  {ev.statement}
                </p>

                <p className="text-[11px] text-[#8E959E] italic">
                  Rationale: {ev.rationale}
                </p>
              </div>

              {ev.sourceUrl && (
                <a
                  href={ev.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#B9E5F3] hover:underline shrink-0 border border-white/10 px-2.5 py-1 rounded-lg self-start sm:self-center"
                >
                  <span>Citation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Critical Unknowns Checklist */}
      <div className="rounded-3xl bg-[#0F1214] p-6 sm:p-8 border border-white/10 shadow-xl">
        <span className="text-xs font-mono tracking-widest text-[#8E959E] uppercase">
          Due Diligence
        </span>
        <h3 className="text-xl font-serif text-[#F5F5F2] mt-0.5 mb-2 font-normal">
          Unknowns to Clarify Before Committing
        </h3>
        <p className="text-xs text-[#8E959E] mb-4">
          FEZI recommends clarifying these items in writing before formal signing to avoid unexpected downside.
        </p>

        <div className="space-y-2">
          {report.unknowns.map((unk, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#090B0C] border border-white/5 text-xs text-[#F5F5F2] flex items-start gap-2.5"
            >
              <span className="font-mono text-[#B9E5F3]">#{idx + 1}</span>
              <span>{unk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
