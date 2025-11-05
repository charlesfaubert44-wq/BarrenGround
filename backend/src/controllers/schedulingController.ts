import { Request, Response } from 'express';
import { BusinessHoursModel } from '../models/BusinessHours';
import { OrderModel } from '../models/Order';

/**
 * Get available time slots for a specific date
 * Public endpoint - no authentication required
 */
export async function getAvailableSlots(req: Request, res: Response): Promise<void> {
  try {
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' });
      return;
    }

    // Parse the date
    const requestedDate = new Date(date as string);

    // Validate date
    if (isNaN(requestedDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      res.status(400).json({ error: 'Cannot schedule orders for past dates' });
      return;
    }

    // Check if date is more than 7 days in the future
    const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (requestedDate > maxDate) {
      res.status(400).json({ error: 'Cannot schedule orders more than 7 days in advance' });
      return;
    }

    // Get available slots
    const slots = await BusinessHoursModel.getAvailableSlots(requestedDate, req.shop!.id);

    res.json({
      date: date,
      slots: slots,
      count: slots.length,
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get business hours configuration
 * Public endpoint - no authentication required
 */
export async function getBusinessHours(req: Request, res: Response): Promise<void> {
  try {
    const hours = await BusinessHoursModel.getAll(req.shop!.id);

    // Format response for easier consumption
    const formattedHours = hours.map(h => ({
      dayOfWeek: h.day_of_week,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][h.day_of_week],
      openTime: h.open_time,
      closeTime: h.close_time,
      isClosed: h.is_closed,
      maxOrdersPerSlot: h.max_orders_per_slot,
      slotDuration: h.slot_duration_minutes,
    }));

    res.json({
      hours: formattedHours,
    });
  } catch (error) {
    console.error('Get business hours error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update business hours configuration
 * Employee only endpoint
 */
export async function updateBusinessHours(req: Request, res: Response): Promise<void> {
  try {
    const { dayOfWeek, openTime, closeTime, isClosed, maxOrdersPerSlot, slotDuration } = req.body;

    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      res.status(400).json({ error: 'Invalid day of week. Must be 0-6 (Sunday-Saturday)' });
      return;
    }

    const updateData: any = {};

    if (openTime !== undefined) updateData.open_time = openTime;
    if (closeTime !== undefined) updateData.close_time = closeTime;
    if (isClosed !== undefined) updateData.is_closed = isClosed;
    if (maxOrdersPerSlot !== undefined) updateData.max_orders_per_slot = maxOrdersPerSlot;
    if (slotDuration !== undefined) updateData.slot_duration_minutes = slotDuration;

    const updated = await BusinessHoursModel.update(dayOfWeek, updateData, req.shop!.id);

    if (!updated) {
      res.status(404).json({ error: 'Business hours not found for this day' });
      return;
    }

    res.json({
      success: true,
      hours: updated,
    });
  } catch (error) {
    console.error('Update business hours error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get scheduled orders for a specific date
 * Employee only endpoint
 */
export async function getScheduledOrdersForDate(req: Request, res: Response): Promise<void> {
  try {
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD)' });
      return;
    }

    // Parse the date
    const requestedDate = new Date(date as string);

    // Validate date
    if (isNaN(requestedDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    // Get scheduled orders
    const orders = await OrderModel.getScheduledOrders(requestedDate, req.shop!.id);

    // Group orders by time slot
    const ordersByTime: { [key: string]: any[] } = {};

    orders.forEach(order => {
      if (order.scheduled_time) {
        const timeKey = new Date(order.scheduled_time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        if (!ordersByTime[timeKey]) {
          ordersByTime[timeKey] = [];
        }

        ordersByTime[timeKey].push(order);
      }
    });

    res.json({
      date: date,
      orders: orders,
      ordersByTime: ordersByTime,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error('Get scheduled orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get capacity for a specific time slot
 * Public endpoint - helps users see if a slot is available
 */
export async function getSlotCapacity(req: Request, res: Response): Promise<void> {
  try {
    const { datetime } = req.query;

    if (!datetime) {
      res.status(400).json({ error: 'Datetime parameter is required (ISO 8601 format)' });
      return;
    }

    // Parse the datetime
    const requestedDateTime = new Date(datetime as string);

    // Validate datetime
    if (isNaN(requestedDateTime.getTime())) {
      res.status(400).json({ error: 'Invalid datetime format' });
      return;
    }

    // Get slot capacity
    const capacity = await BusinessHoursModel.getSlotCapacityWithSettings(requestedDateTime, req.shop!.id);

    res.json({
      datetime: datetime,
      capacity: capacity,
    });
  } catch (error) {
    console.error('Get slot capacity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
