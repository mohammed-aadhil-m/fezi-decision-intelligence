import { DecisionReport, DecisionContext, UserPriorities, User } from '../types/decision';

export class FeziApiClient {
  private baseUrl = '/api';
  private tokenKey = 'fezi_auth_token';
  private userKey = 'fezi_auth_user';

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public setToken(token: string | null) {
    if (token) localStorage.setItem(this.tokenKey, token);
    else localStorage.removeItem(this.tokenKey);
  }

  public getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: User | null) {
    if (user) localStorage.setItem(this.userKey, JSON.stringify(user));
    else localStorage.removeItem(this.userKey);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- Auth APIs ---
  public async register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setToken(data.token);
        this.setCurrentUser(data.user);
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  }

  public async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setToken(data.token);
        this.setCurrentUser(data.user);
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  }

  public async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      }).catch(() => {});
    } finally {
      this.setToken(null);
      this.setCurrentUser(null);
    }
  }

  public async getMe(): Promise<User | null> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/me`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  }

  // --- Decisions APIs ---
  public async getDecisions(): Promise<DecisionReport[]> {
    try {
      const res = await fetch(`${this.baseUrl}/decisions`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('Backend DB unavailable, using local cache:', err);
      const cached = localStorage.getItem('fezi_saved_decisions');
      return cached ? JSON.parse(cached) : [];
    }
  }

  public async getDecisionById(id: string): Promise<DecisionReport | null> {
    try {
      const res = await fetch(`${this.baseUrl}/decisions/${id}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('Error fetching decision by id:', err);
      return null;
    }
  }

  public async saveDecision(report: DecisionReport): Promise<DecisionReport> {
    try {
      const res = await fetch(`${this.baseUrl}/decisions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(report),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data || report;
    } catch (err) {
      console.warn('Backend DB save failed, persisting locally:', err);
      return report;
    }
  }

  public async deleteDecision(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/decisions/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch (err) {
      console.error('Error deleting decision from backend DB:', err);
      return false;
    }
  }

  public async analyzeDecision(
    context: DecisionContext,
    priorities: UserPriorities
  ): Promise<DecisionReport> {
    try {
      const res = await fetch(`${this.baseUrl}/decisions/new/analyze`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ context, priorities }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('Backend analyze API error, falling back to client engine:', err);
      const { DecisionEngine } = await import('./decisionEngine');
      const engine = new DecisionEngine();
      return await engine.analyzeDecision(context, priorities);
    }
  }

  public async shareDecision(id: string): Promise<{ success: boolean; publicToken?: string; shareUrl?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/decisions/${id}/share`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  }

  public async getReelScript(id: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/decisions/${id}/reel`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data = await res.json();
      return data.reelScript || null;
    } catch {
      return null;
    }
  }
}

export const api = new FeziApiClient();
