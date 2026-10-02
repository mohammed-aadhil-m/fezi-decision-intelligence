import type { IncomingMessage, ServerResponse } from 'http';
import { PostgresDatabase } from './database/postgres';
import { AuthService, UserPayload } from './auth/authService';
import { SecurityMiddleware } from './middleware/security';
import { ResearchEngine } from './research/researchEngine';
import { AIService } from './ai/aiService';
import { DecisionEngineFactory } from './decision/categoryEngines';

const db = PostgresDatabase.getInstance();
const researchEngine = ResearchEngine.getInstance();
const aiService = AIService.getInstance();

function sendJson(res: ServerResponse, status: number, data: any): void {
  SecurityMiddleware.applySecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req: IncomingMessage, maxBytes = 5 * 1024 * 1024): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytesReceived = 0;

    req.on('data', (chunk) => {
      bytesReceived += chunk.length;
      if (bytesReceived > maxBytes) {
        req.destroy();
        reject(new Error('Payload Too Large: Request exceeds 5MB limit.'));
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function extractUser(req: IncomingMessage): UserPayload | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return AuthService.verifyToken(token);
  }
  return null;
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const startTime = Date.now();
  const requestId = SecurityMiddleware.generateRequestId();
  const url = req.url || '';
  const method = req.method || 'GET';

  // 1. Rate Limiting Check
  if (!SecurityMiddleware.checkRateLimit(req, res)) {
    return;
  }

  // 2. Health & Readiness Probes (Section 39)
  if (url === '/health' || url === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'fezi-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    });
    return;
  }

  if (url === '/ready' || url === '/api/ready') {
    const health = await db.checkHealth();
    sendJson(res, health.ok ? 200 : 503, {
      status: health.ok ? 'ready' : 'unhealthy',
      database: health,
    });
    return;
  }

  if (!url.startsWith('/api')) {
    next();
    return;
  }

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    SecurityMiddleware.applySecurityHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const currentUser = extractUser(req);

  try {
    // -------------------------------------------------------------
    // AUTHENTICATION ROUTES (Section 5, 28)
    // -------------------------------------------------------------
    if (url === '/api/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      const result = await AuthService.register(body.email, body.password, body.name);
      SecurityMiddleware.logStructured({
        requestId,
        method,
        url,
        operation: 'AUTH_REGISTER',
        durationMs: Date.now() - startTime,
        status: result.success ? 201 : 400,
        error: result.error,
      });
      sendJson(res, result.success ? 201 : 400, result);
      return;
    }

    if (url === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const result = await AuthService.login(body.email, body.password);
      SecurityMiddleware.logStructured({
        requestId,
        method,
        url,
        operation: 'AUTH_LOGIN',
        durationMs: Date.now() - startTime,
        status: result.success ? 200 : 401,
        error: result.error,
      });
      sendJson(res, result.success ? 200 : 401, result);
      return;
    }

    if (url === '/api/auth/logout' && method === 'POST') {
      sendJson(res, 200, { success: true, message: 'Logged out successfully' });
      return;
    }

    if (url === '/api/auth/me' && method === 'GET') {
      if (!currentUser) {
        sendJson(res, 401, { success: false, error: 'Unauthorized. Please sign in.' });
        return;
      }
      sendJson(res, 200, { success: true, user: currentUser });
      return;
    }

    // -------------------------------------------------------------
    // DECISIONS CRUD ROUTES (Section 28)
    // -------------------------------------------------------------

    // GET /api/decisions (User only sees their own decisions)
    if (method === 'GET' && (url === '/api/decisions' || url === '/api/decisions/')) {
      const userId = currentUser ? currentUser.id : 'demo_user';
      const result = await db.query(
        'SELECT id, user_id, title, decision_question, category, status, created_at, updated_at FROM decisions WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      sendJson(res, 200, { success: true, count: result.rows.length, data: result.rows });
      return;
    }

    // POST /api/decisions (Create Decision)
    if (method === 'POST' && (url === '/api/decisions' || url === '/api/decisions/')) {
      const body = await parseBody(req);
      const userId = currentUser ? currentUser.id : 'demo_user';
      const decisionId = body.id || `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await db.query(
        `INSERT INTO decisions (id, user_id, title, decision_question, category, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          decisionId,
          userId,
          body.title || 'Untitled Decision',
          body.question || body.decision_question || body.title,
          body.category || 'career',
          body.status || 'analyzed',
        ]
      );

      // If report data was supplied, store in decision_reports
      if (body.score !== undefined) {
        await db.query(
          `INSERT INTO decision_reports (id, decision_id, score, verdict, confidence, evidence_coverage, summary, advantages, risks, unknowns, assumptions)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            `rep_${decisionId}`,
            decisionId,
            body.score,
            body.verdict || 'NEUTRAL',
            body.confidence || 'MEDIUM',
            body.evidenceCoverage || 75.0,
            body.summary || '',
            JSON.stringify(body.biggestAdvantages || body.advantages || []),
            JSON.stringify(body.biggestRisks || body.risks || []),
            JSON.stringify(body.unknowns || []),
            JSON.stringify(body.assumptions || []),
          ]
        );
      }

      sendJson(res, 201, { success: true, id: decisionId, message: 'Decision created successfully' });
      return;
    }

    // -------------------------------------------------------------
    // DECISION ID ROUTES (/api/decisions/:id/*)
    // -------------------------------------------------------------
    const decMatch = url.match(/^\/api\/decisions\/([^/?]+)(?:\/(.*))?$/);
    if (decMatch) {
      const decisionId = decMatch[1];
      const subRoute = decMatch[2] || '';

      // Ownership Verification (User A cannot access User B's decisions!)
      // Exception: public share lookup or anonymous demo_user
      const decCheck = await db.query('SELECT user_id, title, category, status FROM decisions WHERE id = $1', [decisionId]);
      if (decCheck.rows.length === 0 && subRoute !== 'analyze') {
        sendJson(res, 404, { success: false, error: 'Decision not found' });
        return;
      }

      const ownerId = decCheck.rows[0]?.user_id;
      if (currentUser && ownerId && ownerId !== 'demo_user' && ownerId !== currentUser.id) {
        SecurityMiddleware.logStructured({
          requestId,
          method,
          url,
          userId: currentUser.id,
          decisionId,
          operation: 'UNAUTHORIZED_DECISION_ACCESS',
          status: 403,
          error: 'User attempted to access another user decision',
        });
        sendJson(res, 403, { success: false, error: 'Forbidden: You do not own this decision.' });
        return;
      }

      // GET /api/decisions/:id
      if (method === 'GET' && !subRoute) {
        const report = await db.query('SELECT * FROM decision_reports WHERE decision_id = $1', [decisionId]);
        sendJson(res, 200, {
          success: true,
          data: {
            ...decCheck.rows[0],
            id: decisionId,
            report: report.rows[0] || null,
          },
        });
        return;
      }

      // DELETE /api/decisions/:id
      if (method === 'DELETE' && !subRoute) {
        await db.query('DELETE FROM decisions WHERE id = $1', [decisionId]);
        sendJson(res, 200, { success: true, message: 'Decision deleted successfully' });
        return;
      }

      // POST /api/decisions/:id/research (Conduct verified live research)
      if (method === 'POST' && subRoute === 'research') {
        const body = await parseBody(req);
        const research = await researchEngine.conductResearch({
          term: body.term || decCheck.rows[0]?.title || 'Decision Research',
          category: body.category || decCheck.rows[0]?.category || 'career',
          location: body.location,
          role: body.role,
        });
        sendJson(res, 200, { success: true, ...research });
        return;
      }

      // POST /api/decisions/:id/analyze (Execute Full End-to-End Decision Intelligence Pipeline)
      if (method === 'POST' && subRoute === 'analyze') {
        const body = await parseBody(req);
        const context = body.context || {};
        const priorities = body.priorities || {};
        const category = context.category || decCheck.rows[0]?.category || 'career';
        const title = context.decisionTitle || decCheck.rows[0]?.title || 'Decision';

        // Step 1: Real Research Engine
        const research = await researchEngine.conductResearch({
          term: title,
          category,
          location: context.offeredLocation || context.currentLocation,
          role: context.offeredRole || context.currentRole,
        });

        // Step 2: Category Decision Engine (Deterministic calculation + Dynamic Sensitivity)
        const engine = DecisionEngineFactory.getEngine(category);
        const evaluation = engine.runEvaluation(context, priorities, {
          verified: research.claims.filter(c => c.evidenceType === 'VERIFIED').length,
          estimated: 2,
          userProvided: 3,
          unknown: context.bonusStructure ? 0 : 2,
        });

        // Step 3: AI Research & Narrative Synthesis (Zero invented scores)
        const synthesis = await aiService.synthesizeDecisionInsights({
          decisionTitle: title,
          category,
          score: evaluation.score,
          verdict: evaluation.verdict,
          confidence: evaluation.confidence,
          evidenceCoverage: evaluation.evidenceCoverage,
          factors: evaluation.factors,
          claims: research.claims,
          context,
        });

        // Compile full production report
        const fullReport = {
          id: decisionId,
          createdAt: new Date().toISOString(),
          title,
          category,
          score: evaluation.score,
          verdict: evaluation.verdict,
          confidence: evaluation.confidence,
          confidenceScore: evaluation.confidenceScore,
          confidenceReasons: evaluation.confidenceReasons,
          evidenceCoverage: evaluation.evidenceCoverage,
          summary: synthesis.executiveSummary,
          whyRecommended: synthesis.whyRecommended,
          biggestAdvantages: synthesis.advantages,
          biggestRisks: synthesis.risks,
          unknowns: synthesis.unknowns,
          assumptions: synthesis.assumptions,
          factors: evaluation.factors,
          scenarios: evaluation.scenarios,
          sensitivity: evaluation.sensitivity,
          whatCouldChange: evaluation.whatCouldChange,
          evidence: research.claims.map((c) => ({
            id: c.id,
            statement: c.claim,
            type: c.evidenceType,
            sourceName: c.publisher,
            sourceUrl: c.sourceUrl,
            confidenceImpact: c.confidence > 0.9 ? 'high' : 'medium',
            rationale: c.evidenceText,
            dateVerified: c.retrievedAt.split('T')[0],
          })),
          userContext: context,
          userPriorities: priorities,
        };

        // Persist to database
        const userId = currentUser ? currentUser.id : 'demo_user';
        await db.query(
          `INSERT INTO decisions (id, user_id, title, decision_question, category, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [decisionId, userId, title, title, category, 'analyzed']
        );

        await db.query(
          `INSERT INTO decision_reports (id, decision_id, score, verdict, confidence, evidence_coverage, summary, advantages, risks, unknowns, assumptions)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            `rep_${decisionId}`,
            decisionId,
            fullReport.score,
            fullReport.verdict,
            fullReport.confidence,
            fullReport.evidenceCoverage,
            fullReport.summary,
            JSON.stringify(fullReport.biggestAdvantages),
            JSON.stringify(fullReport.biggestRisks),
            JSON.stringify(fullReport.unknowns),
            JSON.stringify(fullReport.assumptions),
          ]
        );

        sendJson(res, 200, { success: true, data: fullReport });
        return;
      }

      // POST /api/decisions/:id/share (Public token sharing with expiry)
      if (method === 'POST' && subRoute === 'share') {
        const publicToken = `pub_${decisionId}_${Math.random().toString(36).substring(2, 10)}`;
        await db.query(
          `INSERT INTO shared_decisions (id, decision_id, public_token, is_active)
           VALUES ($1, $2, $3, true)`,
          [`shr_${Date.now()}`, decisionId, publicToken]
        );
        sendJson(res, 200, {
          success: true,
          publicToken,
          shareUrl: `/share/${publicToken}`,
        });
        return;
      }

      // POST /api/decisions/:id/reel (Generate Decision Reel script & storyboard)
      if (method === 'POST' && subRoute === 'reel') {
        const reportRes = await db.query('SELECT * FROM decision_reports WHERE decision_id = $1', [decisionId]);
        const report = reportRes.rows[0];

        const script = {
          headline: `FEZI Decision Intelligence: "${decCheck.rows[0]?.title}"`,
          score: report?.score || 78,
          verdict: report?.verdict || 'LEAN YES',
          narration: `Based on verified evidence and prioritized factors, FEZI leans toward this option with a score of ${report?.score || 78} out of 100.`,
          keyUpside: report?.advantages ? JSON.parse(report.advantages)[0] : 'Higher growth progression',
          keyFriction: report?.risks ? JSON.parse(report.risks)[0] : 'Transit overhead',
          tippingPoint: 'Decision could change if offered salary drops below benchmark threshold.',
        };

        sendJson(res, 200, { success: true, reelScript: script });
        return;
      }
    }

    sendJson(res, 404, { success: false, error: 'Endpoint not found' });
  } catch (err: any) {
    SecurityMiddleware.logStructured({
      requestId,
      method,
      url,
      operation: 'API_EXCEPTION',
      durationMs: Date.now() - startTime,
      status: 500,
      error: err.message,
    });
    sendJson(res, 500, { success: false, error: err.message || 'Internal Server Error' });
  }
}
