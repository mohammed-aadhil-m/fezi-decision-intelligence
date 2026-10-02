import fs from 'fs';
import path from 'path';
import { DecisionReport } from '../src/types/decision';
import { SAMPLE_DECISIONS } from '../src/data/sampleDecisions';

const DB_FILE_PATH = path.resolve(process.cwd(), 'database', 'fezi_data.json');

/**
 * Backend Database Manager
 * Supports persistent local JSON store with PostgreSQL schema compatibility.
 */
export class DatabaseManager {
  private static instance: DatabaseManager;

  private constructor() {
    this.ensureDbInitialized();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private ensureDbInitialized() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE_PATH)) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(SAMPLE_DECISIONS, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Failed to initialize database file:', err);
    }
  }

  public async getAllDecisions(): Promise<DecisionReport[]> {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        this.ensureDbInitialized();
      }
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data) as DecisionReport[];
    } catch (err) {
      console.error('Error reading decisions from database:', err);
      return SAMPLE_DECISIONS;
    }
  }

  public async getDecisionById(id: string): Promise<DecisionReport | null> {
    const all = await this.getAllDecisions();
    return all.find((d) => d.id === id) || null;
  }

  public async saveDecision(report: DecisionReport): Promise<DecisionReport> {
    const all = await this.getAllDecisions();
    const existingIndex = all.findIndex((d) => d.id === report.id);

    if (existingIndex >= 0) {
      all[existingIndex] = report;
    } else {
      all.unshift(report);
    }

    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(all, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving decision to database file:', err);
    }

    return report;
  }

  public async deleteDecision(id: string): Promise<boolean> {
    const all = await this.getAllDecisions();
    const filtered = all.filter((d) => d.id !== id);

    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error deleting decision from database file:', err);
      return false;
    }
  }
}
