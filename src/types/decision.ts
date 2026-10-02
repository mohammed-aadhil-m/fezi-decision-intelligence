export type DecisionCategory =
  | 'career'
  | 'business'
  | 'relocation'
  | 'finance'
  | 'education'
  | 'property'
  | 'purchases'
  | 'personal';

export type VerdictType =
  | 'STRONG YES'
  | 'LEAN YES'
  | 'NEUTRAL'
  | 'LEAN NO'
  | 'STRONG_YES'
  | 'LEAN_YES'
  | 'LEAN_NO';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type EvidenceType = 'VERIFIED' | 'ESTIMATED' | 'USER_PROVIDED' | 'UNKNOWN' | 'CONFLICTING';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface EvidenceItem {
  id: string;
  statement: string;
  type: EvidenceType;
  sourceName?: string;
  sourceUrl?: string;
  confidenceImpact: 'high' | 'medium' | 'low';
  rationale: string;
  dateVerified?: string;
}

export interface DecisionFactor {
  id: string;
  name: string;
  weight: number; // 0 - 100 percentage
  rawScore: number; // 0 - 100
  weightedContribution: number; // weight * rawScore / 100
  explanation: string;
  category: string;
  icon?: string;
}

export interface Scenario {
  type: 'BEST_CASE' | 'EXPECTED_CASE' | 'WORST_CASE';
  label: string;
  score: number;
  verdict: VerdictType;
  assumptions: string[];
  summary: string;
}

export interface SensitivityVariable {
  id: string;
  variable: string;
  baselineValue: string;
  thresholdCondition: string;
  resultingVerdict: VerdictType;
  resultingScore: number;
  explanation: string;
  sensitivity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ComparisonFactor {
  name: string;
  scoreA: number;
  scoreB: number;
  unit?: string;
  valueA?: string;
  valueB?: string;
}

export interface ComparisonData {
  optionAName: string;
  optionBName: string;
  optionAScore: number;
  optionBScore: number;
  factors: ComparisonFactor[];
  tradeoffSummary: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  domain: string;
  authority: 'GOVERNMENT' | 'OFFICIAL_EMPLOYER' | 'MARKET_BENCHMARK' | 'ACADEMIC' | 'USER_REPORT';
  snippet: string;
  reliabilityScore: number; // 0 - 100
}

export interface DecisionContext {
  decisionTitle: string;
  category: DecisionCategory;
  // Career fields
  currentRole?: string;
  currentSalary?: number; // e.g. in LPA or standard currency
  currentLocation?: string;
  offeredRole?: string;
  offeredSalary?: number;
  offeredLocation?: string;
  experienceYears?: number;
  workMode?: 'onsite' | 'hybrid' | 'remote';
  commuteMinutes?: number;
  companySize?: string;
  noticePeriodDays?: number;
  careerGoal?: string;
  otherOffers?: string;
  notes?: string;
  // Dynamic additional context
  customFields?: Record<string, string | number | boolean>;
}

export interface UserPriorities {
  careerGrowth: number;
  salary: number;
  stability: number;
  workLifeBalance: number;
  locationAndCommute: number;
  learningAndCulture: number;
}

export interface DecisionReport {
  id: string;
  createdAt: string;
  title: string;
  category: DecisionCategory;
  score: number; // 0-100 deterministic
  verdict: VerdictType;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  confidenceReasons: string[];
  evidenceCoverage?: number; // 0-100 percentage
  summary: string;
  whyRecommended: string[];
  biggestAdvantages: string[];
  biggestRisks: string[];
  assumptions?: string[];
  whatCouldChange?: string[];
  factors: DecisionFactor[];
  evidence: EvidenceItem[];
  scenarios: Scenario[];
  sensitivity: SensitivityVariable[];
  comparison?: ComparisonData;
  unknowns: string[];
  userContext: DecisionContext;
  userPriorities: UserPriorities;
  sources: ResearchSource[];
}
