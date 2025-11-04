import pool from '../config/database';

/**
 * Log email send attempts to database
 * This helps track email delivery and debug issues
 */
export const logEmailSent = async (
  type: string,
  recipient: string,
  success: boolean,
  error?: string
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO email_logs (type, recipient, success, error, sent_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [type, recipient, success, error || null]
    );
  } catch (err) {
    // Don't throw - logging failure shouldn't break email flow
    console.error('Failed to log email send:', err);
  }
};

/**
 * Get recent email logs for monitoring
 */
export const getRecentEmailLogs = async (limit: number = 50): Promise<any[]> => {
  try {
    const result = await pool.query(
      `SELECT * FROM email_logs
       ORDER BY sent_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (err) {
    console.error('Failed to get email logs:', err);
    return [];
  }
};

/**
 * Get email logs by type
 */
export const getEmailLogsByType = async (type: string, limit: number = 50): Promise<any[]> => {
  try {
    const result = await pool.query(
      `SELECT * FROM email_logs
       WHERE type = $1
       ORDER BY sent_at DESC
       LIMIT $2`,
      [type, limit]
    );
    return result.rows;
  } catch (err) {
    console.error('Failed to get email logs by type:', err);
    return [];
  }
};

/**
 * Get email delivery statistics
 */
export const getEmailStats = async (days: number = 7): Promise<any> => {
  try {
    const result = await pool.query(
      `SELECT
         type,
         COUNT(*) as total_sent,
         SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
         SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed
       FROM email_logs
       WHERE sent_at >= NOW() - INTERVAL '${days} days'
       GROUP BY type
       ORDER BY type`,
      []
    );
    return result.rows;
  } catch (err) {
    console.error('Failed to get email stats:', err);
    return [];
  }
};
