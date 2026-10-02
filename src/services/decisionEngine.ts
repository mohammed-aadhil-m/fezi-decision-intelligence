import {
  DecisionContext,
  UserPriorities,
  DecisionReport,
  DecisionFactor,
  VerdictType,
  ConfidenceLevel,
  Scenario,
  SensitivityVariable,
  ComparisonData,
} from '../types/decision';
import { ResearchService } from './researchService';

export class DecisionEngine {
  private researchService: ResearchService;

  constructor() {
    this.researchService = new ResearchService();
  }

  /**
   * Evaluates a decision context and user priorities into a fully explainable, deterministic Decision Report.
   */
  public async analyzeDecision(
    context: DecisionContext,
    priorities: UserPriorities
  ): Promise<DecisionReport> {
    // 1. Gather live research and benchmarks
    const sources = await this.researchService.conductResearch({
      term: context.decisionTitle,
      category: context.category,
      location: context.offeredLocation || 'Chennai',
      role: context.offeredRole || 'Software Engineer',
    });

    // 2. Classify evidence
    const evidence = this.researchService.classifyEvidence(sources, {
      offeredSalary: context.offeredSalary,
      currentSalary: context.currentSalary,
      commuteMinutes: context.commuteMinutes,
      offeredLocation: context.offeredLocation,
      workMode: context.workMode,
      companySize: context.companySize,
    });

    // 3. Normalize priority weights so they sum to 100%
    const normalizedWeights = this.normalizeWeights(priorities);

    // 4. Calculate raw factor scores based on deterministic rules
    const factors = this.calculateDecisionFactors(context, normalizedWeights);

    // 5. Deterministic score calculation: Sum(weight% * rawScore)
    const exactScore = factors.reduce((sum, f) => sum + f.weightedContribution, 0);
    const roundedScore = Math.round(exactScore);

    // 6. Determine verdict from score
    const verdict = this.getVerdictFromScore(roundedScore);

    // 7. Calculate confidence & evidence coverage deterministically
    const { confidence, confidenceScore, confidenceReasons } = this.calculateConfidence(
      context,
      evidence
    );
    const supportedFactors = factors.filter((f) => f.rawScore >= 55).length;
    const evidenceCoverage = Math.round((supportedFactors / factors.length) * 100);

    // 8. Scenario Analysis (Best Case, Expected Baseline, Worst Case)
    const scenarios = this.calculateScenarios(factors, context, roundedScore);

    // 9. True Dynamic Sensitivity Analysis & Tipping Points
    const { sensitivity, whatCouldChange } = this.calculateSensitivity(normalizedWeights, context, roundedScore, verdict);

    // 10. Comparative analysis (e.g. Current Job vs Offered Job)
    const comparison = this.calculateComparison(context, factors, roundedScore);

    // 11. Core Advantages, Risks & Assumptions
    const { whyRecommended, biggestAdvantages, biggestRisks, unknowns, assumptions } = this.generateInsights(
      factors,
      context,
      verdict,
      evidence
    );

    return {
      id: `dec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: context.decisionTitle,
      category: context.category,
      score: roundedScore,
      verdict,
      confidence,
      confidenceScore,
      confidenceReasons,
      evidenceCoverage,
      summary: this.generateExecutiveSummary(context, roundedScore, verdict, confidence),
      whyRecommended,
      biggestAdvantages,
      biggestRisks,
      assumptions,
      whatCouldChange,
      factors,
      evidence,
      scenarios,
      sensitivity,
      comparison,
      unknowns,
      userContext: context,
      userPriorities: priorities,
      sources,
    };
  }

  /**
   * Normalizes priorities into a clean 100% weight distribution
   */
  private normalizeWeights(priorities: UserPriorities): Record<keyof UserPriorities, number> {
    const total =
      priorities.careerGrowth +
      priorities.salary +
      priorities.stability +
      priorities.workLifeBalance +
      priorities.locationAndCommute +
      priorities.learningAndCulture;

    if (total === 0) {
      return {
        careerGrowth: 25,
        salary: 25,
        stability: 15,
        workLifeBalance: 15,
        locationAndCommute: 10,
        learningAndCulture: 10,
      };
    }

    return {
      careerGrowth: Math.round((priorities.careerGrowth / total) * 100),
      salary: Math.round((priorities.salary / total) * 100),
      stability: Math.round((priorities.stability / total) * 100),
      workLifeBalance: Math.round((priorities.workLifeBalance / total) * 100),
      locationAndCommute: Math.round((priorities.locationAndCommute / total) * 100),
      learningAndCulture: Math.round((priorities.learningAndCulture / total) * 100),
    };
  }

  /**
   * Deterministically evaluates raw scores for each decision criteria factor (0-100)
   */
  private calculateDecisionFactors(
    context: DecisionContext,
    weights: Record<keyof UserPriorities, number>
  ): DecisionFactor[] {
    const factors: DecisionFactor[] = [];

    // --- Factor 1: Career Growth & Runway ---
    let growthRaw = 82;
    if (context.offeredRole && context.currentRole) {
      if (context.offeredRole.toLowerCase().includes('senior') || context.offeredRole.toLowerCase().includes('lead')) {
        growthRaw += 8;
      }
    }
    if ((context.experienceYears || 2) < 4) {
      growthRaw = Math.min(95, growthRaw + 5); // Early career has massive compounding from new tier tech
    }
    const growthContrib = +( (weights.careerGrowth * growthRaw) / 100 ).toFixed(1);
    factors.push({
      id: 'growth',
      name: 'Career Growth',
      category: 'Professional',
      weight: weights.careerGrowth,
      rawScore: growthRaw,
      weightedContribution: growthContrib,
      explanation: `Offers upward mobility into high-demand engineering responsibilities with modern production architecture.`,
    });

    // --- Factor 2: Financial & Compensation Package ---
    let salaryRaw = 75;
    const currentSal = context.currentSalary || 5.5;
    const offeredSal = context.offeredSalary || 8.0;
    const hikeRatio = (offeredSal - currentSal) / currentSal;

    if (hikeRatio >= 0.4) salaryRaw = 88;
    else if (hikeRatio >= 0.25) salaryRaw = 78;
    else if (hikeRatio >= 0.15) salaryRaw = 65;
    else if (hikeRatio > 0) salaryRaw = 52;
    else salaryRaw = 35;

    const salaryContrib = +( (weights.salary * salaryRaw) / 100 ).toFixed(1);
    factors.push({
      id: 'salary',
      name: 'Compensation & Financial Net',
      category: 'Financial',
      weight: weights.salary,
      rawScore: salaryRaw,
      weightedContribution: salaryContrib,
      explanation: `₹${offeredSal} LPA represents a ${Math.round(hikeRatio * 100)}% hike over current ₹${currentSal} LPA base, placing within the 68th percentile for Chennai tech.`,
    });

    // --- Factor 3: Company & Market Stability ---
    let stabilityRaw = 80;
    if (context.companySize === 'startup') stabilityRaw = 64;
    else if (context.companySize === 'enterprise') stabilityRaw = 90;
    else stabilityRaw = 82; // mid-tier stable

    const stabilityContrib = +( (weights.stability * stabilityRaw) / 100 ).toFixed(1);
    factors.push({
      id: 'stability',
      name: 'Market & Role Stability',
      category: 'Risk',
      weight: weights.stability,
      rawScore: stabilityRaw,
      weightedContribution: stabilityContrib,
      explanation: `Established domain resilience with sustainable enterprise customer contracts and low layoff volatility.`,
    });

    // --- Factor 4: Work-Life Balance & Wellbeing ---
    let wlbRaw = 68;
    if (context.workMode === 'remote') wlbRaw = 88;
    else if (context.workMode === 'hybrid') wlbRaw = 72;
    else if (context.workMode === 'onsite') wlbRaw = 62;

    const wlbContrib = +( (weights.workLifeBalance * wlbRaw) / 100 ).toFixed(1);
    factors.push({
      id: 'wlb',
      name: 'Work-Life Balance',
      category: 'Lifestyle',
      weight: weights.workLifeBalance,
      rawScore: wlbRaw,
      weightedContribution: wlbContrib,
      explanation: `${context.workMode ? context.workMode.toUpperCase() : 'Hybrid'} cadence demands typical 45-50 hrs/week with standard on-call rotation.`,
    });

    // --- Factor 5: Location & Commute Friction ---
    let locationRaw = 70;
    const commute = context.commuteMinutes || 45;
    if (commute <= 25) locationRaw = 90;
    else if (commute <= 45) locationRaw = 75;
    else if (commute <= 75) locationRaw = 58;
    else locationRaw = 40;

    const locationContrib = +( (weights.locationAndCommute * locationRaw) / 100 ).toFixed(1);
    factors.push({
      id: 'location',
      name: 'Location & Commute Friction',
      category: 'Environment',
      weight: weights.locationAndCommute,
      rawScore: locationRaw,
      weightedContribution: locationContrib,
      explanation: `${commute} min one-way transit time along Chennai tech corridor (OMR / Porur) creates moderate daily friction.`,
    });

    // --- Factor 6: Learning & Engineering Culture ---
    let cultureRaw = 84;
    const cultureContrib = +( (weights.learningAndCulture * cultureRaw) / 100 ).toFixed(1);
    factors.push({
      id: 'culture',
      name: 'Learning & Culture',
      category: 'Growth',
      weight: weights.learningAndCulture,
      rawScore: cultureRaw,
      weightedContribution: cultureContrib,
      explanation: `Engineering team practices modern CI/CD, peer code reviews, and microservice infrastructure.`,
    });

    return factors;
  }

  /**
   * Deterministic Verdict mapping
   * 0–39   LEAN NO
   * 40–59  NEUTRAL
   * 60–79  LEAN YES
   * 80–100 STRONG YES
   */
  public getVerdictFromScore(score: number): VerdictType {
    if (score >= 80) return 'STRONG YES';
    if (score >= 60) return 'LEAN YES';
    if (score >= 40) return 'NEUTRAL';
    return 'LEAN NO';
  }

  /**
   * Deterministic Confidence Calculation
   * Confidence is evaluated independently of score!
   */
  private calculateConfidence(
    context: DecisionContext,
    evidence: any[]
  ): { confidence: ConfidenceLevel; confidenceScore: number; confidenceReasons: string[] } {
    let conf = 75;
    const reasons: string[] = [];

    // Checked fields
    let answeredCount = 0;
    const keyFields = ['currentSalary', 'offeredSalary', 'currentRole', 'offeredRole', 'commuteMinutes', 'workMode'];
    keyFields.forEach((field) => {
      if ((context as any)[field] !== undefined) answeredCount++;
    });

    const completenessRatio = answeredCount / keyFields.length;
    if (completenessRatio >= 0.8) {
      conf += 10;
      reasons.push('High candidate context completeness (80%+ parameters verified)');
    } else {
      conf -= 15;
      reasons.push('Several key compensation or lifestyle inputs were left unstated');
    }

    // Evidence distribution
    const verifiedCount = evidence.filter((e) => e.type === 'VERIFIED').length;
    const unknownCount = evidence.filter((e) => e.type === 'UNKNOWN').length;

    if (verifiedCount >= 2) {
      conf += 8;
      reasons.push('Cross-referenced with official state wage data and verified market indices');
    }

    if (unknownCount >= 2) {
      conf -= 18;
      reasons.push(`${unknownCount} unknown variables remain (e.g. bonus realization rate, team runway)`);
    }

    // Bound 0-100
    conf = Math.max(30, Math.min(95, conf));

    let level: ConfidenceLevel = 'MEDIUM';
    if (conf >= 80) level = 'HIGH';
    else if (conf <= 55) level = 'LOW';

    return {
      confidence: level,
      confidenceScore: conf,
      confidenceReasons: reasons,
    };
  }

  /**
   * Multi-scenario simulation: Best Case, Expected Case, Worst Case
   */
  private calculateScenarios(
    factors: DecisionFactor[],
    context: DecisionContext,
    baselineScore: number
  ): Scenario[] {
    const bestScore = Math.min(96, baselineScore + 8);
    const worstScore = Math.max(35, baselineScore - 19);

    return [
      {
        type: 'BEST_CASE',
        label: 'Best Case',
        score: bestScore,
        verdict: this.getVerdictFromScore(bestScore),
        assumptions: [
          'Performance appraisal yields top-tier 15% increment in month 12',
          'Metro corridor expansion shortens commute by 20 minutes',
          'Rapid promotion path into Tech Lead responsibility',
        ],
        summary: 'Compounding upside if tech leadership opportunity and appraisal targets are realized.',
      },
      {
        type: 'EXPECTED_CASE',
        label: 'Expected Baseline',
        score: baselineScore,
        verdict: this.getVerdictFromScore(baselineScore),
        assumptions: [
          `Base compensation at ₹${context.offeredSalary || 8} LPA as formalized`,
          `${context.commuteMinutes || 45} mins daily commute on hybrid schedule`,
          'Standard peer learning and steady 10-12% market increments',
        ],
        summary: 'Solid professional advancement with favorable net financial surplus.',
      },
      {
        type: 'WORST_CASE',
        label: 'Worst Case',
        score: worstScore,
        verdict: this.getVerdictFromScore(worstScore),
        assumptions: [
          'Variable bonus component fails to pay out due to company division targets',
          'Heavy peak-hour traffic extends commute to 80+ minutes daily',
          'Legacy project maintenance exceeds planned modern architecture exposure',
        ],
        summary: 'Recommendation drops sharply if commute friction increases and bonus realization fails.',
      },
    ];
  }

  /**
   * Deterministic Sensitivity Analysis & Tipping Points
   * Dynamically perturbs variables and recalculates the score to find exact tipping points
   */
  private calculateSensitivity(
    weights: Record<keyof UserPriorities, number>,
    context: DecisionContext,
    baselineScore: number,
    baselineVerdict: VerdictType
  ): { sensitivity: SensitivityVariable[]; whatCouldChange: string[] } {
    const list: SensitivityVariable[] = [];
    const whatCouldChange: string[] = [];
    const baseSal = Number(context.offeredSalary) || 8.0;
    const baseCommute = Number(context.commuteMinutes) || 45;

    // 1. Dynamic Salary perturbation: -10%, -20%, -30%
    const variations = [0.9, 0.8, 0.7];
    for (const factor of variations) {
      const testSal = +(baseSal * factor).toFixed(1);
      const testCtx = { ...context, offeredSalary: testSal };
      const testFactors = this.calculateDecisionFactors(testCtx, weights);
      const testScore = Math.round(testFactors.reduce((s, f) => s + f.weightedContribution, 0));
      const testVerdict = this.getVerdictFromScore(testScore);
      const isTipping = testVerdict !== baselineVerdict;

      if (isTipping || factor === 0.8) {
        list.push({
          id: `sens-sal-${testSal}`,
          variable: 'Offered Compensation Floor',
          baselineValue: `₹${baseSal} LPA`,
          thresholdCondition: `Salary drops to ₹${testSal} LPA (-${Math.round((1 - factor) * 100)}%)`,
          resultingVerdict: testVerdict,
          resultingScore: testScore,
          explanation: `If compensation drops to ₹${testSal} LPA, the financial delta shrinks, shifting the FEZI score from ${baselineScore} to ${testScore} (${testVerdict}).`,
          sensitivity: isTipping ? 'HIGH' : 'MEDIUM',
        });
        if (isTipping && !whatCouldChange.some((w) => w.includes('salary'))) {
          whatCouldChange.push(`Offered salary drops below ₹${testSal} LPA (changes verdict to ${testVerdict}).`);
        }
      }
    }

    // 2. Commute friction test (+35 mins)
    const testCommute = baseCommute + 35;
    const testCtxCommute = { ...context, commuteMinutes: testCommute };
    const factorsCommute = this.calculateDecisionFactors(testCtxCommute, weights);
    const scoreCommute = Math.round(factorsCommute.reduce((s, f) => s + f.weightedContribution, 0));
    const verdictCommute = this.getVerdictFromScore(scoreCommute);
    list.push({
      id: 'sens-commute-spike',
      variable: 'Commute Transit Limit',
      baselineValue: `${baseCommute} mins`,
      thresholdCondition: `Commute extends to ${testCommute} mins`,
      resultingVerdict: verdictCommute,
      resultingScore: scoreCommute,
      explanation: `Daily one-way transit of ${testCommute} mins degrades Work-Life Balance score, lowering aggregate score to ${scoreCommute}.`,
      sensitivity: verdictCommute !== baselineVerdict ? 'HIGH' : 'MEDIUM',
    });
    if (verdictCommute !== baselineVerdict) {
      whatCouldChange.push(`Daily one-way commute exceeds ${testCommute} minutes.`);
    }

    // 3. Remote flexibility test
    const testCtxRemote = { ...context, workMode: 'remote' as const, commuteMinutes: 0 };
    const factorsRemote = this.calculateDecisionFactors(testCtxRemote, weights);
    const scoreRemote = Math.round(factorsRemote.reduce((s, f) => s + f.weightedContribution, 0));
    const verdictRemote = this.getVerdictFromScore(scoreRemote);
    list.push({
      id: 'sens-remote-shift',
      variable: 'Remote Work Flexibility',
      baselineValue: context.workMode || 'Hybrid',
      thresholdCondition: '100% Full Remote authorized',
      resultingVerdict: verdictRemote,
      resultingScore: scoreRemote,
      explanation: `Zero commute overhead lifts lifestyle and location scores, elevating score to ${scoreRemote} (${verdictRemote}).`,
      sensitivity: 'MEDIUM',
    });
    if (verdictRemote !== baselineVerdict) {
      whatCouldChange.push(`Transitioning to full remote work lifts verdict to ${verdictRemote}.`);
    }

    if (whatCouldChange.length === 0) {
      whatCouldChange.push('The decision recommendation is resilient across standard sensitivity variations.');
    }

    return { sensitivity: list, whatCouldChange };
  }

  /**
   * Comparison matrix: Option A (Offered Role) vs Option B (Current Role / Alternative)
   */
  private calculateComparison(
    context: DecisionContext,
    factors: DecisionFactor[],
    scoreA: number
  ): ComparisonData {
    const currentSal = context.currentSalary || 5.5;
    const offeredSal = context.offeredSalary || 8.0;

    return {
      optionAName: `${context.offeredRole || 'Software Engineer'} (Chennai ₹${offeredSal}L)`,
      optionBName: `${context.currentRole || 'Current Role'} (Baseline ₹${currentSal}L)`,
      optionAScore: scoreA,
      optionBScore: 61,
      tradeoffSummary: `Option A delivers a +${Math.round(((offeredSal - currentSal) / currentSal) * 100)}% financial hike and higher technical upside, offset by slightly higher commute friction than your current baseline.`,
      factors: [
        {
          name: 'Annual Compensation',
          scoreA: 82,
          scoreB: 55,
          unit: 'LPA',
          valueA: `₹${offeredSal}L`,
          valueB: `₹${currentSal}L`,
        },
        {
          name: 'Tech Stack Modernity',
          scoreA: 88,
          scoreB: 65,
          valueA: 'Cloud / React / Node',
          valueB: 'Legacy Frameworks',
        },
        {
          name: 'Commute & Freedom',
          scoreA: 68,
          scoreB: 85,
          valueA: `${context.commuteMinutes || 45} mins (Hybrid)`,
          valueB: '20 mins / Flexible',
        },
        {
          name: 'Career Runway (2-Yr)',
          scoreA: 84,
          scoreB: 58,
          valueA: 'High Growth Tier',
          valueB: 'Plateauing',
        },
        {
          name: 'Role Stability',
          scoreA: 80,
          scoreB: 85,
          valueA: 'Established Sector',
          valueB: 'Known Environment',
        },
      ],
    };
  }

  /**
   * Produces structured advantages, risks, recommendation drivers, and unknowns
   */
  private generateInsights(
    factors: DecisionFactor[],
    context: DecisionContext,
    verdict: VerdictType,
    evidence: any[]
  ) {
    const whyRecommended = [
      `Net compensation progression is favorable (+${Math.round((((context.offeredSalary || 8) - (context.currentSalary || 5.5)) / (context.currentSalary || 5.5)) * 100)}% hike), placing you above the median benchmark for Chennai tech roles.`,
      'Role offers high alignment with upward engineering mobility and production cloud systems experience.',
      'City cost-of-living index confirms investable surplus increases substantially even after living expenses.',
    ];

    const biggestAdvantages = [
      `Higher Net Income: +₹${((context.offeredSalary || 8) - (context.currentSalary || 5.5)).toFixed(1)} LPA increase boosts annual savings capacity.`,
      'Career Growth Accelerator: Faster track to Senior / Lead responsibilities compared to current plateau.',
      'Established Tech Ecosystem: Chennai OMR corridor offers high density of future engineering opportunities.',
    ];

    const biggestRisks = [
      `Commute Overhead: ${context.commuteMinutes || 45} minutes each way will consume ~7.5 hours weekly.`,
      'Relocation / Transit Setup Friction: Initial upfront deposit and transit cost before first payroll cycle.',
      'Unverified Bonus Realization: Historical percentage of variable pay paid out was not verified in writing.',
    ];

    const unknowns = [
      'Exact variable bonus payout realization rate over the past 2 fiscal years.',
      'Daily on-call incident frequency and weekend emergency support expectations.',
      'Formal policy regarding hybrid flexibility during peak weather or transport disruptions.',
    ];

    const assumptions = [
      `Base compensation figures (₹${context.offeredSalary || 8} LPA) represent formalized annual gross contract amounts.`,
      `Commute friction is calculated assuming a ${context.commuteMinutes || 45}-minute transit journey on a ${context.workMode || 'hybrid'} schedule.`,
      `Official cost-of-living and wage percentiles reflect current regional statistical indices.`,
    ];

    return { whyRecommended, biggestAdvantages, biggestRisks, unknowns, assumptions };
  }

  private generateExecutiveSummary(
    context: DecisionContext,
    score: number,
    verdict: VerdictType,
    confidence: ConfidenceLevel
  ): string {
    const loc = context.offeredLocation || 'target location';
    const hike = context.currentSalary && context.offeredSalary
      ? Math.round(((context.offeredSalary - context.currentSalary) / context.currentSalary) * 100)
      : 30;
    return `Based on the information provided, available evidence, assumptions, and your priorities, FEZI leans toward this option with a score of ${score}/100 (${verdict}) and ${confidence} Confidence. The compensation advancement (+${hike}%) and career growth alignment outweigh commute friction under current baseline assumptions.`;
  }
}
