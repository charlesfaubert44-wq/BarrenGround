import pool from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  created_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<Omit<User, 'password_hash'>> {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone)
       VALUES ($1, $2, $3, $4) RETURNING id, email, name, phone, created_at`,
      [userData.email, password_hash, userData.name, userData.phone]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<Omit<User, 'password_hash'> | null> {
    const result = await pool.query(
      'SELECT id, email, name, phone, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(id: number, updates: Partial<Pick<User, 'name' | 'phone'>>): Promise<Omit<User, 'password_hash'> | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updates.phone);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, name, phone, created_at`,
      values
    );
    return result.rows[0] || null;
  }

  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [password_hash, id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
