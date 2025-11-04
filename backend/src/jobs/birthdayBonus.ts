import cron from 'node-cron';
import pool from '../config/database';
import { LoyaltyTransactionModel } from '../models/LoyaltyTransaction';

/**
 * Birthday Bonus Job
 * Runs daily at midnight to check for user birthdays
 * Awards 50 bonus points to users on their birthday (once per year)
 */
export function startBirthdayBonusJob() {
  // Run daily at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Birthday Bonus] Checking for birthday bonuses...');

    try {
      const currentYear = new Date().getFullYear();

      // Find users whose birthday is today and haven't received bonus this year
      const result = await pool.query(
        `SELECT id, email, name
         FROM users
         WHERE date_of_birth IS NOT NULL
           AND EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
           AND EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
           AND (last_birthday_bonus_year IS NULL OR last_birthday_bonus_year < $1)`,
        [currentYear]
      );

      if (result.rows.length === 0) {
        console.log('[Birthday Bonus] No birthdays today');
        return;
      }

      console.log(`[Birthday Bonus] Found ${result.rows.length} birthday(s) today`);

      // Award birthday bonus to each user
      for (const user of result.rows) {
        try {
          await LoyaltyTransactionModel.addBonusPoints(
            user.id,
            50,
            'birthday',
            `Birthday bonus ${currentYear}`
          );

          // Update last birthday bonus year
          await pool.query(
            'UPDATE users SET last_birthday_bonus_year = $1 WHERE id = $2',
            [currentYear, user.id]
          );

          console.log(`[Birthday Bonus] Awarded 50 points to ${user.name} (${user.email})`);

          // TODO: Send birthday email notification
          // This would require email service integration
        } catch (error) {
          console.error(`[Birthday Bonus] Failed to award points to user ${user.id}:`, error);
        }
      }

      console.log('[Birthday Bonus] Birthday bonus job completed');
    } catch (error) {
      console.error('[Birthday Bonus] Error running birthday bonus job:', error);
    }
  });

  console.log('✅ Birthday bonus job scheduled (runs daily at midnight)');
}
