import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export class PostgresDatabase {
  private static instance: PostgresDatabase;
  private pool: pg.Pool | null = null;
  private isConnected = false;
  private connectionError: Error | null = null;

  private constructor() {
    this.initPool();
  }

  public static getInstance(): PostgresDatabase {
    if (!PostgresDatabase.instance) {
      PostgresDatabase.instance = new PostgresDatabase();
    }
    return PostgresDatabase.instance;
  }

  private initPool() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('⚠️ [FEZI Database] No DATABASE_URL provided. Operating in adaptive persistence mode.');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' && !connectionString.includes('localhost')
          ? { rejectUnauthorized: false }
          : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      this.pool.on('error', (err) => {
        console.error('💥 [FEZI Database] Unexpected PostgreSQL pool error:', err);
        this.connectionError = err;
      });
    } catch (err: any) {
      console.error('💥 [FEZI Database] Failed to initialize PostgreSQL pool:', err);
      this.connectionError = err;
    }
  }

  public async checkHealth(): Promise<{ ok: boolean; message: string; mode: string }> {
    if (this.pool) {
      try {
        const client = await this.pool.connect();
        try {
          await client.query('SELECT 1 as live');
          return { ok: true, message: 'PostgreSQL connection active', mode: 'postgresql' };
        } finally {
          client.release();
        }
      } catch (err: any) {
        return { ok: false, message: `PostgreSQL connection error: ${err.message}`, mode: 'postgresql-error' };
      }
    }
    return { ok: true, message: 'Adaptive persistence active (no DATABASE_URL configured)', mode: 'adaptive-json' };
  }

  public async query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    if (this.pool) {
      const client = await this.pool.connect();
      try {
        const res = await client.query(text, params);
        return { rows: res.rows, rowCount: res.rowCount || 0 };
      } finally {
        client.release();
      }
    }

    // Adaptive local JSON fallback if running locally without Postgres installed
    return this.fallbackQuery<T>(text, params);
  }

  public async runMigrations(): Promise<{ success: boolean; applied: string[] }> {
    const applied: string[] = [];
    const migrationsDir = path.resolve(process.cwd(), 'database', 'migrations');
    if (!fs.existsSync(migrationsDir)) return { success: true, applied };

    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    if (this.pool) {
      const client = await this.pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        for (const file of files) {
          const check = await client.query('SELECT version FROM schema_migrations WHERE version = $1', [file]);
          if (check.rows.length === 0) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
            await client.query('COMMIT');
            applied.push(file);
            console.log(`✅ [FEZI Migration] Successfully executed ${file}`);
          }
        }
        return { success: true, applied };
      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('💥 [FEZI Migration] Failed to run migration:', err);
        return { success: false, applied };
      } finally {
        client.release();
      }
    }

    return { success: true, applied: ['adaptive-mode-ready'] };
  }

  // Adaptive storage engine for development environments without a live PostgreSQL instance
  private fallbackStorePath = path.resolve(process.cwd(), 'database', 'fezi_data.json');

  private getLocalStore(): any {
    try {
      if (!fs.existsSync(this.fallbackStorePath)) {
        return { users: [], decisions: [], reports: [], shares: [] };
      }
      const raw = JSON.parse(fs.readFileSync(this.fallbackStorePath, 'utf-8'));
      if (Array.isArray(raw)) {
        return { users: [], decisions: raw, reports: [], shares: [] };
      }
      return {
        users: raw.users || [],
        decisions: raw.decisions || [],
        reports: raw.reports || [],
        shares: raw.shares || [],
      };
    } catch {
      return { users: [], decisions: [], reports: [], shares: [] };
    }
  }

  private saveLocalStore(data: any) {
    try {
      fs.writeFileSync(this.fallbackStorePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save fallback local store:', err);
    }
  }

  private fallbackQuery<T>(text: string, params: any[]): QueryResult<T> {
    const store = this.getLocalStore();
    const cleanSql = text.trim().toUpperCase();

    // SELECT 1
    if (cleanSql.startsWith('SELECT 1')) {
      return { rows: [{ live: 1 }] as any, rowCount: 1 };
    }

    // USERS: SELECT by email
    if (cleanSql.includes('FROM USERS WHERE EMAIL = $1')) {
      const email = params[0]?.toLowerCase();
      const users = (store.users || []).filter((u: any) => u.email?.toLowerCase() === email);
      return { rows: users as any, rowCount: users.length };
    }

    // USERS: SELECT by id
    if (cleanSql.includes('FROM USERS WHERE ID = $1')) {
      const id = params[0];
      const users = (store.users || []).filter((u: any) => u.id === id);
      return { rows: users as any, rowCount: users.length };
    }

    // USERS: INSERT
    if (cleanSql.startsWith('INSERT INTO USERS')) {
      store.users = store.users || [];
      const newUser = {
        id: params[0],
        email: params[1]?.toLowerCase(),
        password_hash: params[2],
        name: params[3],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.users.push(newUser);
      this.saveLocalStore(store);
      return { rows: [newUser] as any, rowCount: 1 };
    }

    // DECISIONS: SELECT all for user
    if (cleanSql.includes('FROM DECISIONS WHERE USER_ID = $1')) {
      const userId = params[0];
      const decs = (store.decisions || []).filter((d: any) => d.user_id === userId);
      return { rows: decs as any, rowCount: decs.length };
    }

    // DECISIONS: SELECT by ID
    if (cleanSql.includes('FROM DECISIONS WHERE ID = $1')) {
      const id = params[0];
      const decs = (store.decisions || []).filter((d: any) => d.id === id);
      return { rows: decs as any, rowCount: decs.length };
    }

    // DECISIONS: INSERT / UPSERT
    if (cleanSql.startsWith('INSERT INTO DECISIONS')) {
      store.decisions = store.decisions || [];
      const newDec = {
        id: params[0],
        user_id: params[1],
        title: params[2],
        decision_question: params[3],
        category: params[4] || 'career',
        status: params[5] || 'analyzed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const idx = store.decisions.findIndex((d: any) => d.id === newDec.id);
      if (idx >= 0) store.decisions[idx] = newDec;
      else store.decisions.unshift(newDec);
      this.saveLocalStore(store);
      return { rows: [newDec] as any, rowCount: 1 };
    }

    // DECISION_REPORTS: SELECT by decision_id
    if (cleanSql.includes('FROM DECISION_REPORTS WHERE DECISION_ID = $1')) {
      const decisionId = params[0];
      const reps = (store.reports || []).filter((r: any) => r.decision_id === decisionId);
      return { rows: reps as any, rowCount: reps.length };
    }

    // DECISION_REPORTS: INSERT
    if (cleanSql.startsWith('INSERT INTO DECISION_REPORTS')) {
      store.reports = store.reports || [];
      const newRep = {
        id: params[0] || `rep_${Date.now()}`,
        decision_id: params[1],
        score: params[2],
        verdict: params[3],
        confidence: params[4],
        evidence_coverage: params[5],
        summary: params[6],
        advantages: params[7],
        risks: params[8],
        unknowns: params[9],
        assumptions: params[10],
        generated_at: new Date().toISOString(),
      };
      const idx = store.reports.findIndex((r: any) => r.decision_id === newRep.decision_id);
      if (idx >= 0) store.reports[idx] = newRep;
      else store.reports.push(newRep);
      this.saveLocalStore(store);
      return { rows: [newRep] as any, rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }
}
