import { DecisionCategory } from '../types/decision';

export interface DynamicQuestion {
  id: string;
  label: string;
  sublabel?: string;
  placeholder?: string;
  type: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  required: boolean;
  materialImpact: string; // Explains why this question matters to the scoring model
}

export interface CategoryQuestionConfig {
  currentSituationHeading: string;
  currentSituationSubheading: string;
  currentQuestions: DynamicQuestion[];
  optionHeading: string;
  optionSubheading: string;
  optionQuestions: DynamicQuestion[];
  defaultPriorities: { key: string; label: string; desc: string; defaultWeight: number }[];
}

export const CATEGORY_QUESTION_CONFIGS: Record<DecisionCategory, CategoryQuestionConfig> = {
  career: {
    currentSituationHeading: 'First, tell us about your current situation.',
    currentSituationSubheading: 'FEZI uses your baseline role and compensation to model realistic progression deltas.',
    currentQuestions: [
      {
        id: 'currentRole',
        label: 'Current Job / Role',
        placeholder: 'e.g. Junior Software Engineer',
        type: 'text',
        required: true,
        materialImpact: 'Determines professional seniority jump and career runway.',
      },
      {
        id: 'currentSalary',
        label: 'Current Compensation (Annual / LPA)',
        placeholder: 'e.g. 5.5',
        type: 'number',
        required: true,
        materialImpact: 'Direct baseline for net financial hike and disposable income delta.',
      },
      {
        id: 'experienceYears',
        label: 'Years of Experience',
        placeholder: 'e.g. 2.5',
        type: 'number',
        required: true,
        materialImpact: 'Cross-referenced against official labor market wage percentiles.',
      },
      {
        id: 'currentLocation',
        label: 'Current City / Location',
        placeholder: 'e.g. Coimbatore',
        type: 'text',
        required: true,
        materialImpact: 'Calculates cost-of-living differential and relocation friction.',
      },
      {
        id: 'careerGoal',
        label: 'Primary 2-Year Career Goal',
        placeholder: 'e.g. Senior Fullstack / Tech Lead in production systems',
        type: 'text',
        required: false,
        materialImpact: 'Influences the Career Alignment factor score.',
      },
      {
        id: 'currentConstraints',
        label: 'Current Constraints or Notice Period',
        placeholder: 'e.g. 60 days notice, family in hometown',
        type: 'text',
        required: false,
        materialImpact: 'Identifies timing and transition risks.',
      },
    ],
    optionHeading: 'Now, tell us about the opportunity being considered.',
    optionSubheading: 'Specify the proposed offer terms to compare against your baseline.',
    optionQuestions: [
      {
        id: 'offeredRole',
        label: 'Offered Role / Title',
        placeholder: 'e.g. Software Developer',
        type: 'text',
        required: true,
        materialImpact: 'Assesses upward mobility and responsibility expansion.',
      },
      {
        id: 'offeredSalary',
        label: 'Offered Salary (Annual / LPA)',
        placeholder: 'e.g. 8.0',
        type: 'number',
        required: true,
        materialImpact: 'Primary driver for financial scoring and sensitivity analysis.',
      },
      {
        id: 'offeredLocation',
        label: 'Job Location',
        placeholder: 'e.g. Chennai (OMR Corridor)',
        type: 'text',
        required: true,
        materialImpact: 'Queries localized rent and transit indices.',
      },
      {
        id: 'workMode',
        label: 'Work Arrangement',
        type: 'select',
        options: [
          { value: 'hybrid', label: 'Hybrid (2–3 days in office)' },
          { value: 'onsite', label: '100% Onsite (5 days office)' },
          { value: 'remote', label: '100% Full Remote' },
        ],
        required: true,
        materialImpact: 'Directly dictates Work-Life Balance and weekly transit overhead.',
      },
      {
        id: 'commuteMinutes',
        label: 'Expected One-Way Commute (Minutes)',
        placeholder: 'e.g. 45',
        type: 'number',
        required: true,
        materialImpact: 'Calculates weekly exhaustion penalty and tipping points.',
      },
      {
        id: 'benefits',
        label: 'Benefits & Bonus Terms',
        placeholder: 'e.g. Standard health cover, up to 10% variable bonus',
        type: 'text',
        required: false,
        materialImpact: 'Identifies unknown variable bonus realization risks.',
      },
    ],
    defaultPriorities: [
      { key: 'careerGrowth', label: 'Career Growth & Promotion Velocity', desc: 'Upward trajectory, high-visibility projects', defaultWeight: 30 },
      { key: 'salary', label: 'Compensation & Financial Net', desc: 'Base salary, bonuses, take-home savings rate', defaultWeight: 25 },
      { key: 'stability', label: 'Company Stability & Layoff Defense', desc: 'Profitability, customer contracts, funding runway', defaultWeight: 15 },
      { key: 'workLifeBalance', label: 'Work-Life Balance & Flexibility', desc: 'Working hours, on-call pressure, personal time', defaultWeight: 15 },
      { key: 'locationAndCommute', label: 'Location & Commute Freedom', desc: 'Transit time, traffic overhead, city lifestyle', defaultWeight: 15 },
    ],
  },

  relocation: {
    currentSituationHeading: 'First, tell us about your current situation.',
    currentSituationSubheading: 'FEZI evaluates quality of life, tax rates, and disposable surplus deltas.',
    currentQuestions: [
      {
        id: 'currentLocation',
        label: 'Current Country / City',
        placeholder: 'e.g. London, UK',
        type: 'text',
        required: true,
        materialImpact: 'Forms the baseline for tax brackets and civic amenities.',
      },
      {
        id: 'currentSalary',
        label: 'Current Net Income (Annual)',
        placeholder: 'e.g. 62000',
        type: 'number',
        required: true,
        materialImpact: 'Calculates take-home savings gap.',
      },
      {
        id: 'familySituation',
        label: 'Family / Household Status',
        placeholder: 'e.g. Single, or Relocating with spouse & 1 child',
        type: 'text',
        required: false,
        materialImpact: 'Factors in international schooling and dependent healthcare overhead.',
      },
      {
        id: 'reasonForMoving',
        label: 'Primary Motivation for Moving',
        placeholder: 'e.g. Wealth acceleration, warmer climate, international exposure',
        type: 'text',
        required: false,
        materialImpact: 'Aligns the verdict with personal life priorities.',
      },
    ],
    optionHeading: 'Now, tell us about the target destination and opportunity.',
    optionSubheading: 'Specify the target city and compensation to simulate cost-of-living deltas.',
    optionQuestions: [
      {
        id: 'offeredLocation',
        label: 'Target Destination (City, Country)',
        placeholder: 'e.g. Dubai, UAE (DIFC / Marina)',
        type: 'text',
        required: true,
        materialImpact: 'Loads official municipal tax statutes and rental indexes.',
      },
      {
        id: 'offeredSalary',
        label: 'Offered Compensation (Target Currency Annual)',
        placeholder: 'e.g. 95000 (Tax-free)',
        type: 'number',
        required: true,
        materialImpact: 'Calculates 0% tax savings and rental affordability.',
      },
      {
        id: 'visaStatus',
        label: 'Visa & Residency Sponsorship',
        placeholder: 'e.g. Employer sponsored Golden Visa or Standard Employment Visa',
        type: 'text',
        required: false,
        materialImpact: 'Assesses immigration stability and long-term security.',
      },
      {
        id: 'housingAllowance',
        label: 'Housing Allowance / Relocation Package',
        placeholder: 'e.g. 2 months corporate accommodation provided',
        type: 'text',
        required: false,
        materialImpact: 'Reduces initial upfront capital burn in Year 1.',
      },
    ],
    defaultPriorities: [
      { key: 'salary', label: 'Net Take-Home Savings Rate', desc: 'After tax and cost-of-living adjustments', defaultWeight: 35 },
      { key: 'careerGrowth', label: 'International Career Mobility', desc: 'Regional leadership and market exposure', defaultWeight: 25 },
      { key: 'stability', label: 'Civic Safety & Governance', desc: 'Personal security, infrastructure, legal stability', defaultWeight: 20 },
      { key: 'workLifeBalance', label: 'Lifestyle & Climate Comfort', desc: 'Weather adaptation, social life, recreation', defaultWeight: 20 },
    ],
  },

  business: {
    currentSituationHeading: 'First, tell us about your current baseline.',
    currentSituationSubheading: 'FEZI calculates your survival runway before commercial break-even is required.',
    currentQuestions: [
      {
        id: 'currentRole',
        label: 'Current Employment Status',
        placeholder: 'e.g. Corporate Senior Product Manager ($140k/yr)',
        type: 'text',
        required: true,
        materialImpact: 'Calculates the opportunity cost of resigning.',
      },
      {
        id: 'availableRunway',
        label: 'Available Personal & Venture Cash Runway ($ / ₹)',
        placeholder: 'e.g. 50000',
        type: 'number',
        required: true,
        materialImpact: 'Core determinant of solvency risk against procurement latency.',
      },
      {
        id: 'founderExperience',
        label: 'Domain & Founder Experience',
        placeholder: 'e.g. 6 years managing B2B enterprise SaaS tooling',
        type: 'text',
        required: false,
        materialImpact: 'Evaluates product-market fit velocity.',
      },
    ],
    optionHeading: 'Now, tell us about the venture you are considering.',
    optionSubheading: 'Specify business model parameters to assess market risk.',
    optionQuestions: [
      {
        id: 'businessModel',
        label: 'Venture Category & Business Model',
        placeholder: 'e.g. B2B Enterprise AI Workflow SaaS ($1k/mo ACV)',
        type: 'text',
        required: true,
        materialImpact: 'Benchmarks enterprise sales cycle lengths.',
      },
      {
        id: 'preOrdersOrLOIs',
        label: 'Pre-sales Validation / Signed LOIs',
        placeholder: 'e.g. 0 signed LOIs currently, 5 customer discovery calls',
        type: 'text',
        required: true,
        materialImpact: 'Major tipping point between NEUTRAL and LEAN YES verdicts.',
      },
      {
        id: 'monthlyBurn',
        label: 'Estimated Monthly Venture Burn ($ / ₹)',
        placeholder: 'e.g. 4500 (Living + Cloud APIs + Incorporation)',
        type: 'number',
        required: true,
        materialImpact: 'Calculates exact runway months before capital exhaustion.',
      },
    ],
    defaultPriorities: [
      { key: 'stability', label: 'Financial Runway & Downside Protection', desc: 'Survival months without revenue', defaultWeight: 35 },
      { key: 'careerGrowth', label: 'Long-term Equity Compounding', desc: 'Asymmetric enterprise valuation upside', defaultWeight: 30 },
      { key: 'salary', label: 'Commercial Validation Speed', desc: 'Signed customer commitments & pilots', defaultWeight: 20 },
      { key: 'workLifeBalance', label: 'Psychological & Stress Load', desc: 'Burnout resilience and autonomy', defaultWeight: 15 },
    ],
  },

  education: {
    currentSituationHeading: 'First, tell us about your current academic & career baseline.',
    currentSituationSubheading: 'FEZI calculates return on tuition investment and career acceleration.',
    currentQuestions: [
      {
        id: 'currentEducation',
        label: 'Current Qualification & Background',
        placeholder: 'e.g. B.Tech Computer Science (3.4 GPA, 2 YOE)',
        type: 'text',
        required: true,
        materialImpact: 'Determines admission viability and post-study salary leaps.',
      },
      {
        id: 'currentSalary',
        label: 'Current Annual Earnings (if working)',
        placeholder: 'e.g. 6.5',
        type: 'number',
        required: false,
        materialImpact: 'Models the opportunity cost of stepping out of the workforce.',
      },
      {
        id: 'maxBudget',
        label: 'Total Available Education Budget (Savings + Loans)',
        placeholder: 'e.g. 3500000',
        type: 'number',
        required: true,
        materialImpact: 'Debt repayment stress and financial ROI horizon.',
      },
    ],
    optionHeading: 'Now, tell us about the program or university option.',
    optionSubheading: 'Provide program details to calculate median graduate compensation.',
    optionQuestions: [
      {
        id: 'targetProgram',
        label: 'Target Degree / Course & Institution',
        placeholder: 'e.g. MS in Data Systems at Technical University of Munich',
        type: 'text',
        required: true,
        materialImpact: 'Cross-referenced with employment outcome reports.',
      },
      {
        id: 'totalTuitionCost',
        label: 'Estimated Tuition & Living Expenses',
        placeholder: 'e.g. 2400000',
        type: 'number',
        required: true,
        materialImpact: 'Calculates payback period in months post graduation.',
      },
      {
        id: 'postGradLocation',
        label: 'Target Post-Graduation Employment Market',
        placeholder: 'e.g. Germany / EU Tech Hubs',
        type: 'text',
        required: true,
        materialImpact: 'Evaluates post-study work visa rights and hiring rates.',
      },
    ],
    defaultPriorities: [
      { key: 'careerGrowth', label: 'Post-Graduation Career Velocity', desc: 'Placement rates, median starting packages', defaultWeight: 35 },
      { key: 'salary', label: 'Financial ROI & Debt Payback Period', desc: 'Total cost vs net earnings delta', defaultWeight: 30 },
      { key: 'stability', label: 'Institution Reputation & Visa Security', desc: 'Global rankings, post-study residency rights', defaultWeight: 20 },
      { key: 'workLifeBalance', label: 'Student Experience & Academic Fit', desc: 'Curriculum rigor, campus culture, location', defaultWeight: 15 },
    ],
  },

  finance: {
    currentSituationHeading: 'First, tell us about your current financial situation.',
    currentSituationSubheading: 'FEZI analyzes cash flow safety, asset allocation, and emergency reserves.',
    currentQuestions: [
      {
        id: 'currentNetWorth',
        label: 'Current Liquid Savings & Investments',
        placeholder: 'e.g. ₹25,00,000 liquid reserves',
        type: 'text',
        required: true,
        materialImpact: 'Checks portfolio concentration risk.',
      },
      {
        id: 'monthlyCashFlow',
        label: 'Current Net Monthly Surplus',
        placeholder: 'e.g. 45000',
        type: 'number',
        required: true,
        materialImpact: 'Determines monthly debt-service ratio capacity.',
      },
    ],
    optionHeading: 'Now, tell us about the financial commitment or asset.',
    optionSubheading: 'Specify commitment terms to model expected returns and liquidity lock-in.',
    optionQuestions: [
      {
        id: 'commitmentAmount',
        label: 'Commitment / Investment Outlay',
        placeholder: 'e.g. 1500000',
        type: 'number',
        required: true,
        materialImpact: 'Assesses liquidity risk and capital lock-up.',
      },
      {
        id: 'expectedHorizon',
        label: 'Expected Holding Horizon (Years)',
        placeholder: 'e.g. 5 Years',
        type: 'text',
        required: true,
        materialImpact: 'Factors in compounding return assumptions vs volatility.',
      },
    ],
    defaultPriorities: [
      { key: 'salary', label: 'Net Capital Appreciation / Yield', desc: 'Risk-adjusted expected return', defaultWeight: 40 },
      { key: 'stability', label: 'Capital Preservation & Liquidity', desc: 'Ease of exit and loss protection', defaultWeight: 35 },
      { key: 'workLifeBalance', label: 'Simplicity & Peace of Mind', desc: 'Zero administrative friction or maintenance', defaultWeight: 25 },
    ],
  },

  property: {
    currentSituationHeading: 'First, tell us about your current housing situation.',
    currentSituationSubheading: 'FEZI models the Rent vs Buy opportunity cost over a 7-year horizon.',
    currentQuestions: [
      {
        id: 'currentRent',
        label: 'Current Monthly Rent & Maintenance',
        placeholder: 'e.g. 24000',
        type: 'number',
        required: true,
        materialImpact: 'Forms the baseline expense curve against mortgage interest.',
      },
      {
        id: 'tenureHorizon',
        label: 'Expected Years in this City',
        placeholder: 'e.g. At least 6–8 years',
        type: 'text',
        required: true,
        materialImpact: 'Determines whether stamp duty and registration fees amortize favorably.',
      },
    ],
    optionHeading: 'Now, tell us about the property purchase terms.',
    optionSubheading: 'Provide purchase price and loan parameters.',
    optionQuestions: [
      {
        id: 'purchasePrice',
        label: 'Total Property Purchase Price',
        placeholder: 'e.g. 8500000',
        type: 'number',
        required: true,
        materialImpact: 'Determines required down payment and loan-to-value ratio.',
      },
      {
        id: 'downPayment',
        label: 'Available Down Payment Amount',
        placeholder: 'e.g. 2000000',
        type: 'number',
        required: true,
        materialImpact: 'Checks depletion of emergency reserves.',
      },
    ],
    defaultPriorities: [
      { key: 'salary', label: 'Net Wealth Creation (Rent vs Buy ROI)', desc: 'Equity accumulation vs investing the down payment', defaultWeight: 35 },
      { key: 'stability', label: 'Cash Flow Safety & EMI Buffer', desc: 'EMI resilience against job loss', defaultWeight: 35 },
      { key: 'workLifeBalance', label: 'Housing Security & Living Quality', desc: 'Stability for family, customization, commute', defaultWeight: 30 },
    ],
  },

  purchases: {
    currentSituationHeading: 'First, tell us about your current usage and existing asset.',
    currentSituationSubheading: 'FEZI models utility value, maintenance cost, and depreciation curve.',
    currentQuestions: [
      {
        id: 'currentProduct',
        label: 'Current Vehicle / Device & Status',
        placeholder: 'e.g. 2017 Hatchback (needs frequent repairs)',
        type: 'text',
        required: true,
        materialImpact: 'Assesses remaining utility life and replacement necessity.',
      },
      {
        id: 'annualUsage',
        label: 'Typical Annual Usage / Mileage',
        placeholder: 'e.g. 15,000 km/year or 10 hrs daily work',
        type: 'text',
        required: true,
        materialImpact: 'Measures cost-per-hour and depreciation acceleration.',
      },
    ],
    optionHeading: 'Now, tell us about the new product being evaluated.',
    optionSubheading: 'Specify cost and expected retention period.',
    optionQuestions: [
      {
        id: 'purchaseCost',
        label: 'Total Purchase / Out-of-pocket Cost',
        placeholder: 'e.g. 1400000',
        type: 'number',
        required: true,
        materialImpact: 'Determines upfront capital outlay and financing cost.',
      },
      {
        id: 'expectedLifespan',
        label: 'Planned Retention Horizon (Years)',
        placeholder: 'e.g. 7 Years',
        type: 'text',
        required: true,
        materialImpact: 'Amortizes upfront premium over product lifespan.',
      },
    ],
    defaultPriorities: [
      { key: 'salary', label: 'Total Cost of Ownership & Depreciation', desc: 'Purchase price, insurance, maintenance, resale', defaultWeight: 40 },
      { key: 'stability', label: 'Reliability & Build Quality', desc: 'Breakdown frequency, warranty coverage', defaultWeight: 35 },
      { key: 'workLifeBalance', label: 'Daily Utility & Experience Upgrade', desc: 'Comfort, speed, time saved', defaultWeight: 25 },
    ],
  },

  personal: {
    currentSituationHeading: 'First, tell us about your current situation.',
    currentSituationSubheading: 'FEZI analyzes trade-offs, time allocation, and stress exposure.',
    currentQuestions: [
      {
        id: 'currentCommitment',
        label: 'Current Time & Lifestyle Commitment',
        placeholder: 'e.g. 50 hrs/week corporate job with young children',
        type: 'text',
        required: true,
        materialImpact: 'Determines bandwidth baseline before new commitments.',
      },
      {
        id: 'mainConflict',
        label: 'The Core Dilemma or Pain Point',
        placeholder: 'e.g. Feeling plateaued vs risk of disrupting routine',
        type: 'text',
        required: true,
        materialImpact: 'Identifies core psychological and lifestyle trade-offs.',
      },
    ],
    optionHeading: 'Now, tell us about the change being considered.',
    optionSubheading: 'Specify the proposed commitment or direction.',
    optionQuestions: [
      {
        id: 'proposedChange',
        label: 'The Proposed Change / Commitment',
        placeholder: 'e.g. Taking a 6-month sabbatical to retrain',
        type: 'text',
        required: true,
        materialImpact: 'Models the reversible vs irreversible nature of the choice.',
      },
      {
        id: 'downsideWorstCase',
        label: 'What is the Worst-Case Outcome?',
        placeholder: 'e.g. Spending $15k and returning to similar job level',
        type: 'text',
        required: false,
        materialImpact: 'Feeds the worst-case scenario analysis.',
      },
    ],
    defaultPriorities: [
      { key: 'workLifeBalance', label: 'Personal Wellbeing & Fulfillment', desc: 'Mental health, personal satisfaction, health', defaultWeight: 40 },
      { key: 'careerGrowth', label: 'Long-term Meaning & Trajectory', desc: 'Growth, skills, expanded horizon', defaultWeight: 35 },
      { key: 'stability', label: 'Routine Safety & Downside Resilience', desc: 'Avoiding severe financial or family stress', defaultWeight: 25 },
    ],
  },
};
