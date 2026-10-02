import type { IncomingMessage, ServerResponse } from 'http';

// In-memory token bucket rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 reqs/min

export interface SecurityContext {
  requestId: string;
  clientIp: string;
  startTime: number;
}

export class SecurityMiddleware {
  public static applySecurityHeaders(res: ServerResponse, allowedOrigin: string = '*'): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  public static checkRateLimit(req: IncomingMessage, res: ServerResponse): boolean {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return true;
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
      res.writeHead(429, {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((record.resetAt - now) / 1000).toString(),
      });
      res.end(JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait before making more requests.',
      }));
      return false;
    }

    record.count++;
    return true;
  }

  public static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  public static logStructured(data: {
    requestId: string;
    method?: string;
    url?: string;
    userId?: string;
    decisionId?: string;
    operation: string;
    durationMs?: number;
    status: number;
    error?: string;
  }): void {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      ...data,
    };

    if (data.status >= 500) {
      console.error(`💥 [ERROR] ${JSON.stringify(logObject)}`);
    } else if (data.status >= 400) {
      console.warn(`⚠️ [WARN] ${JSON.stringify(logObject)}`);
    } else {
      console.log(`ℹ️ [INFO] ${JSON.stringify(logObject)}`);
    }
  }
}
