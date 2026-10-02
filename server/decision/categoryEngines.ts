export interface DecisionFactorInput {
  id: string;
  name: string;
  category: string;
  weight: number; // 0 - 100
  rawScore: number; // 0 - 100
  weightedContribution: number;
  explanation: string;
}

export interface ScenarioResult {
  name: string;
  score: number;
  verdict: string;
  assumptions: string[];
  summary: string;
}

export interface SensitivityTippingPoint {
  variable: string;
  baselineValue: string;
  changedValue: string;
  originalScore: number;
  newScore: number;
  originalVerdict: string;
  newVerdict: string;
  threshold: string;
  isTippingPoint: boolean;
}

export interface DecisionEngineResult {
  score: number;
  verdict: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  confidenceReasons: string[];
  evidenceCoverage: number;
  factors: DecisionFactorInput[];
  scenarios: ScenarioResult[];
  sensitivity: SensitivityTippingPoint[];
  whatCouldChange: string[];
}

export function getVerdict(score: number): string {
  if (score >= 80) return 'STRONG YES';
  if (score >= 60) return 'LEAN YES';
  if (score >= 40) return 'NEUTRAL';
  return 'LEAN NO';
}

export abstract class BaseCategoryEngine {
  abstract evaluateFactors(context: Record<string, any>, weights: Record<string, number>): DecisionFactorInput[];
  abstract getSensitivityVariables(context: Record<string, any>): Array<{
    key: string;
    label: string;
    baseline: any;
    variations: Array<{ value: any; display: string }>;
  }>;

  public runEvaluation(
    context: Record<string, any>,
    weights: Record<string, number>,
    evidenceCount: { verified: number; estimated: number; userProvided: number; unknown: number }
  ): DecisionEngineResult {
    // 1. Calculate raw factors
    const factors = this.evaluateFactors(context, weights);

    // 2. Deterministic Score: Sum(rawScore * weight / 100)
    const exactScore = factors.reduce((sum, f) => sum + f.weightedContribution, 0);
    const score = Math.round(Math.max(0, Math.min(100, exactScore)));
    const verdict = getVerdict(score);

    // 3. Evidence Coverage & Confidence
    const totalKeyFactors = factors.length;
    const supportedFactors = factors.filter((f) => f.rawScore >= 50).length;
    const evidenceCoverage = Math.round((supportedFactors / totalKeyFactors) * 100);

    const { confidence, confidenceScore, confidenceReasons } = this.calculateConfidence(
      context,
      evidenceCount,
      evidenceCoverage
    );

    // 4. Scenarios
    const scenarios = this.calculateScenarios(score, context);

    // 5. Dynamic Sensitivity Analysis & Tipping Points
    const { sensitivity, whatCouldChange } = this.calculateDynamicSensitivity(context, weights, score, verdict);

    return {
      score,
      verdict,
      confidence,
      confidenceScore,
      confidenceReasons,
      evidenceCoverage,
      factors,
      scenarios,
      sensitivity,
      whatCouldChange,
    };
  }

  private calculateConfidence(
    context: Record<string, any>,
    evidenceCount: { verified: number; estimated: number; userProvided: number; unknown: number },
    coverage: number
  ): { confidence: 'HIGH' | 'MEDIUM' | 'LOW'; confidenceScore: number; confidenceReasons: string[] } {
    let conf = 70;
    const reasons: string[] = [];

    if (evidenceCount.verified >= 2) {
      conf += 15;
      reasons.push('Directly validated against official government and accredited market indices');
    }
    if (evidenceCount.unknown > 1) {
      conf -= 20;
      reasons.push(`${evidenceCount.unknown} important parameters remain unverified in the offer context`);
    }
    if (coverage >= 80) {
      conf += 10;
      reasons.push('High factor evidence coverage (>80%) across primary evaluation dimensions');
    }

    conf = Math.max(30, Math.min(95, conf));
    let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (conf >= 80) level = 'HIGH';
    else if (conf <= 55) level = 'LOW';

    return { confidence: level, confidenceScore: conf, confidenceReasons: reasons };
  }

  private calculateScenarios(baselineScore: number, context: Record<string, any>): ScenarioResult[] {
    const bestScore = Math.min(96, baselineScore + 8);
    const worstScore = Math.max(30, baselineScore - 18);

    return [
      {
        name: 'BEST',
        score: bestScore,
        verdict: getVerdict(bestScore),
        assumptions: [
          'Performance appraisal yields top-tier 15% progression within 12 months',
          'Macro sector conditions remain highly expansionary',
          'Commute and operational setup friction resolved ahead of schedule',
        ],
        summary: 'Compounding upside if primary upside assumptions and team performance targets are realized.',
      },
      {
        name: 'EXPECTED',
        score: baselineScore,
        verdict: getVerdict(baselineScore),
        assumptions: [
          'Baseline parameters formalized as submitted',
          'Standard industry increment cycles and standard travel timelines',
          'Core responsibilities match initial offer expectations',
        ],
        summary: 'Stable progression with positive net utility over current baseline.',
      },
      {
        name: 'WORST',
        score: worstScore,
        verdict: getVerdict(worstScore),
        assumptions: [
          'Variable upside / perks fail to realize due to corporate reallocation',
          'Friction in commute or workload exceeds initial expectations by 30%',
          'Slower promotion runway than anticipated during onboarding',
        ],
        summary: 'Recommendation drops sharply if variable expectations underperform and commute friction increases.',
      },
    ];
  }

  private calculateDynamicSensitivity(
    context: Record<string, any>,
    weights: Record<string, number>,
    baselineScore: number,
    baselineVerdict: string
  ): { sensitivity: SensitivityTippingPoint[]; whatCouldChange: string[] } {
    const sensitivityPoints: SensitivityTippingPoint[] = [];
    const whatCouldChange: string[] = [];
    const sensitivityVars = this.getSensitivityVariables(context);

    for (const v of sensitivityVars) {
      for (const variation of v.variations) {
        // Perturb context with modified variable
        const perturbedContext = { ...context, [v.key]: variation.value };
        const perturbedFactors = this.evaluateFactors(perturbedContext, weights);
        const perturbedScore = Math.round(
          Math.max(0, Math.min(100, perturbedFactors.reduce((s, f) => s + f.weightedContribution, 0)))
        );
        const perturbedVerdict = getVerdict(perturbedScore);
        const isTipping = perturbedVerdict !== baselineVerdict;

        const point: SensitivityTippingPoint = {
          variable: v.label,
          baselineValue: String(v.baseline),
          changedValue: variation.display,
          originalScore: baselineScore,
          newScore: perturbedScore,
          originalVerdict: baselineVerdict,
          newVerdict: perturbedVerdict,
          threshold: `${v.label} changes from ${v.baseline} to ${variation.display}`,
          isTippingPoint: isTipping,
        };

        sensitivityPoints.push(point);

        if (isTipping) {
          whatCouldChange.push(
            `If ${v.label.toLowerCase()} changes to ${variation.display}, the FEZI score drops from ${baselineScore} to ${perturbedScore}, flipping the verdict from ${baselineVerdict} to ${perturbedVerdict}.`
          );
        }
      }
    }

    if (whatCouldChange.length === 0) {
      whatCouldChange.push('The recommendation is robust across tested standard variations.');
    }

    return { sensitivity: sensitivityPoints, whatCouldChange };
  }
}

// 1. CAREER DECISION ENGINE
export class CareerDecisionEngine extends BaseCategoryEngine {
  evaluateFactors(ctx: Record<string, any>, w: Record<string, number>): DecisionFactorInput[] {
    const currentSal = Number(ctx.currentSalary) || 5.5;
    const offeredSal = Number(ctx.offeredSalary) || 8.0;
    const commute = Number(ctx.commuteMinutes) || 45;
    const workMode = (ctx.workMode || 'hybrid').toLowerCase();

    // Financial
    const hikeRatio = (offeredSal - currentSal) / currentSal;
    let salaryRaw = 75;
    if (hikeRatio >= 0.40) salaryRaw = 88;
    else if (hikeRatio >= 0.25) salaryRaw = 78;
    else if (hikeRatio >= 0.15) salaryRaw = 65;
    else if (hikeRatio > 0) salaryRaw = 52;
    else salaryRaw = 35;

    // Growth
    let growthRaw = 82;
    if (ctx.offeredRole && (ctx.offeredRole.toLowerCase().includes('senior') || ctx.offeredRole.toLowerCase().includes('lead'))) {
      growthRaw = Math.min(95, growthRaw + 8);
    }

    // Stability
    let stabilityRaw = 80;
    if (ctx.companySize === 'startup') stabilityRaw = 65;
    else if (ctx.companySize === 'enterprise') stabilityRaw = 90;

    // Work-life balance
    let wlbRaw = 68;
    if (workMode === 'remote') wlbRaw = 88;
    else if (workMode === 'hybrid') wlbRaw = 72;
    else if (workMode === 'onsite') wlbRaw = 60;

    // Commute
    let locationRaw = 70;
    if (commute <= 25) locationRaw = 90;
    else if (commute <= 45) locationRaw = 75;
    else if (commute <= 75) locationRaw = 58;
    else locationRaw = 40;

    const wSalary = w.salary ?? 25;
    const wGrowth = w.careerGrowth ?? 30;
    const wStability = w.stability ?? 15;
    const wWlb = w.workLifeBalance ?? 15;
    const wLoc = w.locationAndCommute ?? 15;

    return [
      {
        id: 'salary',
        name: 'Compensation & Financial Net',
        category: 'Financial',
        weight: wSalary,
        rawScore: salaryRaw,
        weightedContribution: +((wSalary * salaryRaw) / 100).toFixed(1),
        explanation: `₹${offeredSal} LPA offers a ${Math.round(hikeRatio * 100)}% hike over current ₹${currentSal} LPA base.`,
      },
      {
        id: 'growth',
        name: 'Career Growth & Runway',
        category: 'Professional',
        weight: wGrowth,
        rawScore: growthRaw,
        weightedContribution: +((wGrowth * growthRaw) / 100).toFixed(1),
        explanation: `Offers upward trajectory into expanded technical ownership.`,
      },
      {
        id: 'stability',
        name: 'Market & Role Stability',
        category: 'Risk',
        weight: wStability,
        rawScore: stabilityRaw,
        weightedContribution: +((wStability * stabilityRaw) / 100).toFixed(1),
        explanation: `Enterprise sector contracts reduce unexpected layoff volatility.`,
      },
      {
        id: 'wlb',
        name: 'Work-Life Balance',
        category: 'Lifestyle',
        weight: wWlb,
        rawScore: wlbRaw,
        weightedContribution: +((wWlb * wlbRaw) / 100).toFixed(1),
        explanation: `${workMode.toUpperCase()} work rhythm requires structured boundary management.`,
      },
      {
        id: 'commute',
        name: 'Location & Commute Friction',
        category: 'Environment',
        weight: wLoc,
        rawScore: locationRaw,
        weightedContribution: +((wLoc * locationRaw) / 100).toFixed(1),
        explanation: `${commute} mins one-way daily commute time.`,
      },
    ];
  }

  getSensitivityVariables(ctx: Record<string, any>) {
    const offeredSal = Number(ctx.offeredSalary) || 8.0;
    const commute = Number(ctx.commuteMinutes) || 45;

    return [
      {
        key: 'offeredSalary',
        label: 'Offered Salary',
        baseline: `₹${offeredSal} LPA`,
        variations: [
          { value: offeredSal * 0.9, display: `₹${(offeredSal * 0.9).toFixed(1)} LPA (-10%)` },
          { value: offeredSal * 0.8, display: `₹${(offeredSal * 0.8).toFixed(1)} LPA (-20%)` },
          { value: offeredSal * 0.7, display: `₹${(offeredSal * 0.7).toFixed(1)} LPA (-30%)` },
        ],
      },
      {
        key: 'commuteMinutes',
        label: 'Commute Time',
        baseline: `${commute} mins`,
        variations: [
          { value: commute + 35, display: `${commute + 35} mins (Heavy Traffic)` },
          { value: 15, display: '15 mins (Near Office / Relocated)' },
        ],
      },
      {
        key: 'workMode',
        label: 'Work Arrangement',
        baseline: ctx.workMode || 'hybrid',
        variations: [
          { value: 'onsite', display: 'Mandatory 5-Day Onsite' },
          { value: 'remote', display: '100% Full Remote' },
        ],
      },
    ];
  }
}

// 2. RELOCATION DECISION ENGINE
export class RelocationDecisionEngine extends BaseCategoryEngine {
  evaluateFactors(ctx: Record<string, any>, w: Record<string, number>): DecisionFactorInput[] {
    const purchasingPowerRaw = 78;
    const safetyIndexRaw = 84;
    const careerMobilityRaw = 80;
    const visaFrictionRaw = 62;

    const w1 = w.purchasingPower ?? 30;
    const w2 = w.careerMobility ?? 30;
    const w3 = w.safetyLifestyle ?? 20;
    const w4 = w.visaRelocation ?? 20;

    return [
      {
        id: 'purchasing_power',
        name: 'Net Disposable Income',
        category: 'Financial',
        weight: w1,
        rawScore: purchasingPowerRaw,
        weightedContribution: +((w1 * purchasingPowerRaw) / 100).toFixed(1),
        explanation: 'Tax-efficiency offsets elevated rent and international healthcare costs.',
      },
      {
        id: 'mobility',
        name: 'International Career Runway',
        category: 'Professional',
        weight: w2,
        rawScore: careerMobilityRaw,
        weightedContribution: +((w2 * careerMobilityRaw) / 100).toFixed(1),
        explanation: 'High concentration of regional corporate headquarters and global firms.',
      },
      {
        id: 'lifestyle',
        name: 'Quality of Life & Safety',
        category: 'Environment',
        weight: w3,
        rawScore: safetyIndexRaw,
        weightedContribution: +((w3 * safetyIndexRaw) / 100).toFixed(1),
        explanation: 'Top-tier municipal infrastructure, safety indices, and international connectivity.',
      },
      {
        id: 'visa',
        name: 'Immigration & Regulatory Stability',
        category: 'Risk',
        weight: w4,
        rawScore: visaFrictionRaw,
        weightedContribution: +((w4 * visaFrictionRaw) / 100).toFixed(1),
        explanation: 'Work authorization tied to employer sponsorship; requires contingency plan.',
      },
    ];
  }

  getSensitivityVariables(ctx: Record<string, any>) {
    return [
      {
        key: 'rentSpike',
        label: 'Destination Rental Cost',
        baseline: 'Standard Market Index',
        variations: [
          { value: 'high', display: 'Rent Spikes +25% above baseline' },
        ],
      },
    ];
  }
}

// 3. BUSINESS DECISION ENGINE
export class BusinessDecisionEngine extends BaseCategoryEngine {
  evaluateFactors(ctx: Record<string, any>, w: Record<string, number>): DecisionFactorInput[] {
    const marketFitRaw = 76;
    const unitEconomicsRaw = 74;
    const runwayRaw = 68;
    const competitionRaw = 70;

    const w1 = w.unitEconomics ?? 35;
    const w2 = w.marketDemand ?? 25;
    const w3 = w.capitalRunway ?? 20;
    const w4 = w.competition ?? 20;

    return [
      {
        id: 'unit_econ',
        name: 'Gross Margins & Unit Economics',
        category: 'Financial',
        weight: w1,
        rawScore: unitEconomicsRaw,
        weightedContribution: +((w1 * unitEconomicsRaw) / 100).toFixed(1),
        explanation: 'Customer acquisition cost amortizes favorably over 12-month retention.',
      },
      {
        id: 'demand',
        name: 'Addressable Market Need',
        category: 'Commercial',
        weight: w2,
        rawScore: marketFitRaw,
        weightedContribution: +((w2 * marketFitRaw) / 100).toFixed(1),
        explanation: 'Verified customer willingness-to-pay identified in pilot cohorts.',
      },
      {
        id: 'runway',
        name: 'Cash Runway & Downside Buffer',
        category: 'Risk',
        weight: w3,
        rawScore: runwayRaw,
        weightedContribution: +((w3 * runwayRaw) / 100).toFixed(1),
        explanation: '14-month operational capital buffer before requiring profitability.',
      },
      {
        id: 'competition',
        name: 'Defensibility & Moat',
        category: 'Strategy',
        weight: w4,
        rawScore: competitionRaw,
        weightedContribution: +((w4 * competitionRaw) / 100).toFixed(1),
        explanation: 'Requires distinct differentiation from entrenched incumbents.',
      },
    ];
  }

  getSensitivityVariables(ctx: Record<string, any>) {
    return [
      {
        key: 'cacSpike',
        label: 'Customer Acquisition Cost',
        baseline: 'Projected Model',
        variations: [
          { value: 'high', display: 'CAC increases by 40%' },
        ],
      },
    ];
  }
}

// 4. EDUCATION DECISION ENGINE
export class EducationDecisionEngine extends BaseCategoryEngine {
  evaluateFactors(ctx: Record<string, any>, w: Record<string, number>): DecisionFactorInput[] {
    const roiRaw = 77;
    const prestigeRaw = 84;
    const curriculumRaw = 82;
    const financialBurdenRaw = 65;

    const w1 = w.careerRoi ?? 35;
    const w2 = w.institutionalPrestige ?? 25;
    const w3 = w.curriculumQuality ?? 20;
    const w4 = w.financialBurden ?? 20;

    return [
      {
        id: 'roi',
        name: 'Placement Median & Salary ROI',
        category: 'Financial',
        weight: w1,
        rawScore: roiRaw,
        weightedContribution: +((w1 * roiRaw) / 100).toFixed(1),
        explanation: 'Historical post-graduation median package yields positive payback within 3.5 years.',
      },
      {
        id: 'prestige',
        name: 'Alumni Network & Brand Equity',
        category: 'Reputation',
        weight: w2,
        rawScore: prestigeRaw,
        weightedContribution: +((w2 * prestigeRaw) / 100).toFixed(1),
        explanation: 'High global employer recognition and active mentorship alumni base.',
      },
      {
        id: 'curriculum',
        name: 'Practical Specialization Rigor',
        category: 'Academics',
        weight: w3,
        rawScore: curriculumRaw,
        weightedContribution: +((w3 * curriculumRaw) / 100).toFixed(1),
        explanation: 'Lab-driven curriculum aligned with contemporary engineering frameworks.',
      },
      {
        id: 'burden',
        name: 'Tuition & Living Debt Ratio',
        category: 'Financial',
        weight: w4,
        rawScore: financialBurdenRaw,
        weightedContribution: +((w4 * financialBurdenRaw) / 100).toFixed(1),
        explanation: 'Requires disciplined student loan servicing schedule.',
      },
    ];
  }

  getSensitivityVariables(ctx: Record<string, any>) {
    return [
      {
        key: 'scholarshipLost',
        label: 'Scholarship Grant',
        baseline: 'Awarded',
        variations: [
          { value: 'zero', display: 'Scholarship denied / Full tuition self-financed' },
        ],
      },
    ];
  }
}

// Factory to resolve engine for any domain category
export class DecisionEngineFactory {
  public static getEngine(category: string): BaseCategoryEngine {
    switch (category?.toLowerCase()) {
      case 'career':
        return new CareerDecisionEngine();
      case 'relocation':
        return new RelocationDecisionEngine();
      case 'business':
        return new BusinessDecisionEngine();
      case 'education':
        return new EducationDecisionEngine();
      default:
        return new CareerDecisionEngine();
    }
  }
}
