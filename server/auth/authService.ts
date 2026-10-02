import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PostgresDatabase } from '../database/postgres';

const db = PostgresDatabase.getInstance();
const JWT_SECRET = process.env.JWT_SECRET || 'fezi-production-decision-intelligence-secret-key-2026';
const TOKEN_EXPIRY = '7d';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: UserPayload;
  error?: string;
}

export class AuthService {
  /**
   * Registers a new user with bcrypt-hashed password
   */
  public static async register(email: string, password: string, name: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Valid email address is required.' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    try {
      // Check existing
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      // Hash password with salt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      await db.query(
        'INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)',
        [userId, cleanEmail, passwordHash, name.trim() || 'FEZI Decision Maker']
      );

      const user: UserPayload = { id: userId, email: cleanEmail, name: name.trim() || 'FEZI Decision Maker' };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

      return { success: true, token, user };
    } catch (err: any) {
      console.error('Registration failure:', err);
      return { success: false, error: err.message || 'Internal registration error' };
    }
  }

  /**
   * Authenticates user against stored bcrypt hash
   */
  public static async login(email: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      const res = await db.query('SELECT id, email, password_hash, name FROM users WHERE email = $1', [cleanEmail]);
      if (res.rows.length === 0) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const userRecord = res.rows[0];
      const passwordMatches = await bcrypt.compare(password, userRecord.password_hash);
      if (!passwordMatches) {
        return { success: false, error: 'Invalid email or password.' };
      }

      // Update last login timestamp
      await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [userRecord.id]).catch(() => {});

      const user: UserPayload = { id: userRecord.id, email: userRecord.email, name: userRecord.name };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

      return { success: true, token, user };
    } catch (err: any) {
      console.error('Login failure:', err);
      return { success: false, error: err.message || 'Internal authentication error' };
    }
  }

  /**
   * Verifies JWT and returns UserPayload or null
   */
  public static verifyToken(token: string): UserPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Strict authorization: verifies that the target decision belongs to the requesting user
   */
  public static async verifyDecisionOwnership(decisionId: string, userId: string): Promise<boolean> {
    try {
      const res = await db.query('SELECT user_id FROM decisions WHERE id = $1', [decisionId]);
      if (res.rows.length === 0) return false;
      return res.rows[0].user_id === userId;
    } catch {
      return false;
    }
  }
}
