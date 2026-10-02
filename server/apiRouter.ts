import type { IncomingMessage, ServerResponse } from 'http';
import { DatabaseManager } from './db';
import { DecisionEngine } from '../src/services/decisionEngine';

const db = DatabaseManager.getInstance();
const engine = new DecisionEngine();

function sendJson(res: ServerResponse, status: number, data: any): void {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Handles all /api/* requests matching Spec #27
 */
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const url = req.url || '';
  if (!url.startsWith('/api')) {
    next();
    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    // 1. GET /api/decisions
    if (req.method === 'GET' && (url === '/api/decisions' || url === '/api/decisions/')) {
      const decisions = await db.getAllDecisions();
      sendJson(res, 200, { success: true, count: decisions.length, data: decisions });
      return;
    }

    // 2. POST /api/decisions (Save / Create decision)
    if (req.method === 'POST' && (url === '/api/decisions' || url === '/api/decisions/')) {
      const body = await parseBody(req);
      const saved = await db.saveDecision(body);
      sendJson(res, 201, { success: true, data: saved });
      return;
    }

    // Match /api/decisions/:id
    const singleMatch = url.match(/^\/api\/decisions\/([^/?]+)$/);
    if (singleMatch) {
      const id = singleMatch[1];

      // GET /api/decisions/:id
      if (req.method === 'GET') {
        const found = await db.getDecisionById(id);
        if (!found) {
          sendJson(res, 404, { success: false, message: 'Decision not found' });
          return;
        }
        sendJson(res, 200, { success: true, data: found });
        return;
      }

      // DELETE /api/decisions/:id
      if (req.method === 'DELETE') {
        const deleted = await db.deleteDecision(id);
        sendJson(res, 200, { success: deleted });
        return;
      }
    }

    // Match POST /api/decisions/:id/analyze
    const analyzeMatch = url.match(/^\/api\/decisions\/([^/?]+)\/analyze$/);
    if (req.method === 'POST' && analyzeMatch) {
      const body = await parseBody(req);
      const report = await engine.analyzeDecision(body.context, body.priorities);
      await db.saveDecision(report);
      sendJson(res, 200, { success: true, data: report });
      return;
    }

    // Match POST /api/decisions/:id/share
    const shareMatch = url.match(/^\/api\/decisions\/([^/?]+)\/share$/);
    if (req.method === 'POST' && shareMatch) {
      const id = shareMatch[1];
      const decision = await db.getDecisionById(id);
      if (!decision) {
        sendJson(res, 404, { success: false, message: 'Decision not found' });
        return;
      }
      sendJson(res, 200, {
        success: true,
        shareToken: `share_${id}_${Date.now()}`,
        url: `/share/${id}`,
        data: decision,
      });
      return;
    }

    // Fallthrough for unmatched /api routes
    sendJson(res, 404, { success: false, message: 'API endpoint not found' });
    return;
  } catch (err: any) {
    console.error('API Error:', err);
    sendJson(res, 500, { success: false, error: err.message || 'Internal Server Error' });
    return;
  }
}
