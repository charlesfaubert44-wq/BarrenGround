import pool from '../config/database';

export interface BusinessHours {
  id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  max_orders_per_slot: number;
  slot_duration_minutes: number;
  created_at: Date;
  updated_at: Date;
}

export interface TimeSlot {
  time: string; // "10:00 AM"
  datetime: Date;
  available: boolean;
  ordersCount: number;
  maxOrders: number;
}

export class BusinessHoursModel {
  /**
   * Get all business hours configuration
   */
  static async getAll(): Promise<BusinessHours[]> {
    const result = await pool.query(
      'SELECT * FROM business_hours ORDER BY day_of_week'
    );
    return result.rows;
  }

  /**
   * Get business hours for a specific day
   * @param dayOfWeek - 0=Sunday, 1=Monday, etc.
   */
  static async getByDay(dayOfWeek: number): Promise<BusinessHours | null> {
    const result = await pool.query(
      'SELECT * FROM business_hours WHERE day_of_week = $1',
      [dayOfWeek]
    );
    return result.rows[0] || null;
  }

  /**
   * Update business hours for a specific day
   */
  static async update(
    dayOfWeek: number,
    data: Partial<BusinessHours>
  ): Promise<BusinessHours | null> {
    const allowedFields = ['open_time', 'close_time', 'is_closed', 'max_orders_per_slot', 'slot_duration_minutes'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push(`updated_at = NOW()`);
    values.push(dayOfWeek);

    const result = await pool.query(
      `UPDATE business_hours SET ${updates.join(', ')} WHERE day_of_week = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Check if business is open at a given date/time
   */
  static async isOpen(dateTime: Date): Promise<boolean> {
    const dayOfWeek = dateTime.getDay();
    const hours = await this.getByDay(dayOfWeek);

    if (!hours || hours.is_closed) {
      return false;
    }

    // Extract time from datetime
    const timeStr = dateTime.toTimeString().substring(0, 5); // "HH:MM"

    // Compare times
    return timeStr >= hours.open_time && timeStr <= hours.close_time;
  }

  /**
   * Generate available time slots for a given date
   * @param date - The date to generate slots for
   */
  static async getAvailableSlots(date: Date): Promise<TimeSlot[]> {
    const dayOfWeek = date.getDay();
    const hours = await this.getByDay(dayOfWeek);

    if (!hours || hours.is_closed) {
      return [];
    }

    const slots: TimeSlot[] = [];

    // Parse open and close times
    const [openHour, openMin] = hours.open_time.split(':').map(Number);
    const [closeHour, closeMin] = hours.close_time.split(':').map(Number);

    // Create datetime objects for the specific date
    const currentSlot = new Date(date);
    currentSlot.setHours(openHour, openMin, 0, 0);

    const closeTime = new Date(date);
    closeTime.setHours(closeHour, closeMin, 0, 0);

    const now = new Date();
    const minAdvanceTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    // Generate slots
    while (currentSlot < closeTime) {
      const slotTime = new Date(currentSlot);

      // Only include slots that meet minimum advance notice
      if (slotTime >= minAdvanceTime) {
        // Get current order count for this slot
        const capacity = await this.getSlotCapacity(slotTime, hours.slot_duration_minutes, hours.max_orders_per_slot);

        slots.push({
          time: slotTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          datetime: slotTime,
          available: capacity.available,
          ordersCount: capacity.current,
          maxOrders: capacity.max,
        });
      }

      // Move to next slot
      currentSlot.setMinutes(currentSlot.getMinutes() + hours.slot_duration_minutes);
    }

    return slots;
  }

  /**
   * Check capacity for a specific time slot
   */
  static async getSlotCapacity(
    dateTime: Date,
    slotDuration: number = 15,
    maxOrders: number = 20
  ): Promise<{
    current: number;
    max: number;
    available: boolean;
  }> {
    // Calculate slot boundaries
    const slotStart = new Date(dateTime);
    const slotEnd = new Date(dateTime.getTime() + slotDuration * 60 * 1000);

    // Count orders scheduled within this slot
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM orders
       WHERE is_scheduled = true
         AND scheduled_time >= $1
         AND scheduled_time < $2
         AND status != 'cancelled'`,
      [slotStart, slotEnd]
    );

    const current = parseInt(result.rows[0]?.count || '0');

    return {
      current,
      max: maxOrders,
      available: current < maxOrders,
    };
  }

  /**
   * Get slot capacity using business hours settings
   */
  static async getSlotCapacityWithSettings(dateTime: Date): Promise<{
    current: number;
    max: number;
    available: boolean;
  }> {
    const dayOfWeek = dateTime.getDay();
    const hours = await this.getByDay(dayOfWeek);

    if (!hours || hours.is_closed) {
      return { current: 0, max: 0, available: false };
    }

    return this.getSlotCapacity(dateTime, hours.slot_duration_minutes, hours.max_orders_per_slot);
  }
}
