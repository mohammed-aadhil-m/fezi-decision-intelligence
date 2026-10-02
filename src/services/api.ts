import { DecisionReport, DecisionContext, UserPriorities } from '../types/decision';

export class FeziApiClient {
  private baseUrl = '/api';

  public async getDecisions(): Promise<DecisionReport[]> {
    try {
      const res = await fetch(`${this.baseUrl}/decisions`);
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
      const res = await fetch(`${this.baseUrl}/decisions/${id}`);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
}

export const api = new FeziApiClient();
