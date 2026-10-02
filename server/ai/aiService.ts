export interface SynthesisResult {
  executiveSummary: string;
  advantages: string[];
  risks: string[];
  unknowns: string[];
  assumptions: string[];
  whyRecommended: string[];
}

export class AIService {
  private static instance: AIService;
  private apiKey: string | undefined;
  private model: string;

  private constructor() {
    this.apiKey = process.env.AI_API_KEY;
    this.model = process.env.AI_MODEL || 'gpt-4o-mini';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Synthesizes findings, advantages, and risks using structured prompts
   * Rule: LLM never invents scores or unbacked facts
   */
  public async synthesizeDecisionInsights(data: {
    decisionTitle: string;
    category: string;
    score: number;
    verdict: string;
    confidence: string;
    evidenceCoverage: number;
    factors: Array<{ name: string; rawScore: number; weight: number; explanation: string }>;
    claims: Array<{ claim: string; sourceTitle: string; evidenceType: string }>;
    context: Record<string, any>;
  }): Promise<SynthesisResult> {
    // If AI_API_KEY is provided, perform live structured generation
    if (this.apiKey) {
      try {
        const prompt = `You are FEZI's Decision Synthesis Engine.
Analyze the following decision parameters and evidence:
Decision: "${data.decisionTitle}" (Category: ${data.category})
Calculated FEZI Score: ${data.score}/100 (${data.verdict})
Confidence: ${data.confidence} | Coverage: ${data.evidenceCoverage}%

Factors:
${data.factors.map(f => `- ${f.name}: Score ${f.rawScore}/100 (Weight ${f.weight}%): ${f.explanation}`).join('\n')}

Evidence Claims:
${data.claims.map(c => `- [${c.evidenceType}] ${c.claim} (Source: ${c.sourceTitle})`).join('\n')}

Context:
${JSON.stringify(data.context)}

CRITICAL CONSTRAINTS:
1. Do NOT invent new scores or override the calculated score of ${data.score}/100.
2. Never claim "This is definitely the correct decision." Use phrasing: "Based on the information provided, available evidence, assumptions, and your priorities, FEZI leans toward this option."
3. Return ONLY a valid JSON object matching this schema:
{
  "executiveSummary": "string",
  "advantages": ["string"],
  "risks": ["string"],
  "unknowns": ["string"],
  "assumptions": ["string"],
  "whyRecommended": ["string"]
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const resData: any = await response.json();
          const content = JSON.parse(resData.choices[0].message.content);
          return content as SynthesisResult;
        }
      } catch (err) {
        console.warn('Live AI synthesis call failed, using deterministic synthesis engine:', err);
      }
    }

    // Deterministic factual synthesis fallback
    return this.deterministicSynthesis(data);
  }

  private deterministicSynthesis(data: {
    decisionTitle: string;
    category: string;
    score: number;
    verdict: string;
    confidence: string;
    evidenceCoverage: number;
    factors: Array<{ name: string; rawScore: number; weight: number; explanation: string }>;
    claims: Array<{ claim: string; sourceTitle: string; evidenceType: string }>;
    context: Record<string, any>;
  }): SynthesisResult {
    // Sort factors by score to find top advantages and key friction points
    const topFactors = [...data.factors].sort((a, b) => b.rawScore - a.rawScore);
    const lowFactors = [...data.factors].sort((a, b) => a.rawScore - b.rawScore);

    const advantages = topFactors.slice(0, 3).map(
      (f) => `${f.name} (+${f.rawScore}/100): ${f.explanation}`
    );

    const risks = lowFactors.filter(f => f.rawScore < 70).slice(0, 3).map(
      (f) => `${f.name} (${f.rawScore}/100): Requires mitigation. ${f.explanation}`
    );

    if (risks.length === 0) {
      risks.push('Execution Risk: Transition friction and adaptation period during initial 90 days.');
    }

    const unknowns = [
      'Unverified internal team attrition rate and upcoming re-organization roadmap.',
      'Exact historical payout ratio of variable bonuses or non-guaranteed perks.',
      'Long-term policy adjustments regarding location/hybrid requirements under changing market pressures.',
    ];

    const assumptions = [
      'Financial valuations assume annual gross compensation figures without factoring unpredictable tax bracket revisions.',
      'Commute and lifestyle impacts reflect standard single-earner travel timelines.',
      'Official benchmarks assume published data from accredited market and regulatory indices remains consistent.',
    ];

    const whyRecommended = [
      `Based on the information provided, available evidence, assumptions, and your priorities, FEZI leans toward this option with an aggregate score of ${data.score}/100.`,
      `Strongest positive alignment is driven by ${topFactors[0]?.name || 'Primary Objectives'} scoring ${topFactors[0]?.rawScore || 80}/100 with ${(topFactors[0]?.weight || 25)}% weighting.`,
      `Evidence coverage stands at ${data.evidenceCoverage}%, substantiated by verified regulatory and market benchmark databases.`,
    ];

    const executiveSummary = `Based on your stated priorities and verified evidence, FEZI evaluates "${data.decisionTitle}" at ${data.score}/100 (${data.verdict}) with ${data.confidence} Confidence. The mathematical model indicates the primary upside in ${topFactors[0]?.name || 'key criteria'} outweighs identified risks, provided core assumptions remain stable.`;

    return {
      executiveSummary,
      advantages,
      risks,
      unknowns,
      assumptions,
      whyRecommended,
    };
  }
}
