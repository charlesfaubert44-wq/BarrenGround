# Advanced Order Scheduling System

**Priority:** 🌟 HIGH-VALUE FEATURE
**Phase:** 2 - High-Value Features
**Estimated Time:** 4-6 hours
**Impact:** +10-15% revenue, enables catering, reduces wait times
**Status:** pending

## Description
Allow customers to schedule orders for future dates/times, enabling catering orders, morning rush avoidance, and better capacity planning.

## Business Rules
- Schedule up to 7 days in advance
- Minimum 30 minutes advance notice
- Business hours: 7 AM - 6 PM, Mon-Sat (configurable)
- Max 20 orders per 15-minute time slot
- Different pricing for scheduled orders (optional)
- Reminder notification 15 minutes before pickup

## Tasks

### 1. Database Updates
- [ ] Update orders table `backend/src/config/schema-scheduling.sql`
  ```sql
  ALTER TABLE orders ADD COLUMN scheduled_time TIMESTAMP;
  ALTER TABLE orders ADD COLUMN is_scheduled BOOLEAN DEFAULT false;
  ALTER TABLE orders ADD COLUMN reminder_sent BOOLEAN DEFAULT false;

  CREATE INDEX idx_orders_scheduled ON orders(scheduled_time) WHERE is_scheduled = true;
  CREATE INDEX idx_orders_reminder ON orders(reminder_sent, scheduled_time) WHERE is_scheduled = true;

  -- Store business hours configuration
  CREATE TABLE business_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    max_orders_per_slot INTEGER DEFAULT 20,
    slot_duration_minutes INTEGER DEFAULT 15
  );

  -- Default hours (Mon-Sat, 7 AM - 6 PM)
  INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
    (0, '00:00', '00:00', true),  -- Sunday closed
    (1, '07:00', '18:00', false), -- Monday
    (2, '07:00', '18:00', false), -- Tuesday
    (3, '07:00', '18:00', false), -- Wednesday
    (4, '07:00', '18:00', false), -- Thursday
    (5, '07:00', '18:00', false), -- Friday
    (6, '07:00', '18:00', false); -- Saturday
  ```

- [ ] Run migration

### 2. Create Business Hours Model
- [ ] Create `backend/src/models/BusinessHours.ts`
  ```typescript
  export interface BusinessHours {
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
    max_orders_per_slot: number;
    slot_duration_minutes: number;
  }

  export class BusinessHours {
    static async getAll(): Promise<BusinessHours[]> {
      // Get all business hours
    }

    static async getByDay(dayOfWeek: number): Promise<BusinessHours> {
      // Get hours for specific day
    }

    static async isOpen(dateTime: Date): Promise<boolean> {
      // Check if business is open at given time
    }

    static async getAvailableSlots(date: Date): Promise<TimeSlot[]> {
      // Generate available time slots for a given date
      // Return slots with capacity info
    }

    static async getSlotCapacity(dateTime: Date): Promise<{
      current: number;
      max: number;
      available: boolean;
    }> {
      // Check how many orders already scheduled for this slot
    }
  }

  export interface TimeSlot {
    time: string; // "10:00 AM"
    datetime: Date;
    available: boolean;
    ordersCount: number;
    maxOrders: number;
  }
  ```

### 3. Update Order Model
- [ ] Modify `backend/src/models/Order.ts`
  ```typescript
  export interface CreateOrderData {
    // ... existing fields
    scheduled_time?: Date;
    is_scheduled?: boolean;
  }

  export class Order {
    static async validateScheduledTime(scheduledTime: Date): Promise<{
      valid: boolean;
      error?: string;
    }> {
      const now = new Date();

      // Check minimum advance notice (30 minutes)
      const minTime = new Date(now.getTime() + 30 * 60 * 1000);
      if (scheduledTime < minTime) {
        return {
          valid: false,
          error: 'Orders must be scheduled at least 30 minutes in advance',
        };
      }

      // Check maximum advance (7 days)
      const maxTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (scheduledTime > maxTime) {
        return {
          valid: false,
          error: 'Orders can only be scheduled up to 7 days in advance',
        };
      }

      // Check business hours
      const isOpen = await BusinessHours.isOpen(scheduledTime);
      if (!isOpen) {
        return {
          valid: false,
          error: 'Selected time is outside business hours',
        };
      }

      // Check slot capacity
      const capacity = await BusinessHours.getSlotCapacity(scheduledTime);
      if (!capacity.available) {
        return {
          valid: false,
          error: 'This time slot is fully booked. Please select another time.',
        };
      }

      return { valid: true };
    }

    static async getScheduledOrders(date: Date): Promise<Order[]> {
      // Get all orders scheduled for a specific date
    }
  }
  ```

### 4. Create Scheduling Controller
- [ ] Create `backend/src/controllers/schedulingController.ts`
  ```typescript
  export const getAvailableSlots = async (req: Request, res: Response) => {
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const requestedDate = new Date(date as string);
    const slots = await BusinessHours.getAvailableSlots(requestedDate);

    res.json({ date, slots });
  };

  export const getBusinessHours = async (req: Request, res: Response) => {
    const hours = await BusinessHours.getAll();
    res.json({ hours });
  };

  export const updateBusinessHours = async (req: Request, res: Response) => {
    // Employee only
    // Update business hours configuration
  };

  export const getScheduledOrdersForDate = async (req: Request, res: Response) => {
    // Employee only
    const { date } = req.query;
    const orders = await Order.getScheduledOrders(new Date(date as string));

    res.json({ orders });
  };
  ```

### 5. Update Order Controller
- [ ] Modify `backend/src/controllers/orderController.ts`
  ```typescript
  export const createOrder = async (req: Request, res: Response) => {
    const { scheduled_time, ...orderData } = req.body;

    // If scheduled time provided, validate it
    if (scheduled_time) {
      const scheduledDate = new Date(scheduled_time);
      const validation = await Order.validateScheduledTime(scheduledDate);

      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      orderData.scheduled_time = scheduledDate;
      orderData.is_scheduled = true;
    }

    // ... rest of order creation logic

    // Send confirmation email with scheduled time
    if (order.is_scheduled) {
      await emailService.sendScheduledOrderConfirmation(order);
    }
  };
  ```

### 6. Create Routes
- [ ] Create `backend/src/routes/schedulingRoutes.ts`
  ```typescript
  import { Router } from 'express';
  import * as schedulingController from '../controllers/schedulingController';
  import { authenticateToken } from '../middleware/auth';
  import { requireEmployee } from '../middleware/roleAuth';

  const router = Router();

  // Public routes
  router.get('/available-slots', schedulingController.getAvailableSlots);
  router.get('/business-hours', schedulingController.getBusinessHours);

  // Employee routes
  router.get(
    '/scheduled-orders',
    authenticateToken,
    requireEmployee,
    schedulingController.getScheduledOrdersForDate
  );
  router.put(
    '/business-hours',
    authenticateToken,
    requireEmployee,
    schedulingController.updateBusinessHours
  );

  export default router;
  ```

- [ ] Register in `backend/src/server.ts`

### 7. Frontend - Time Picker Component
- [ ] Create `customer-frontend/src/components/SchedulingTimePicker.tsx`
  ```typescript
  export const SchedulingTimePicker = ({ onTimeSelect }: Props) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const { data: slots, isLoading } = useQuery(
      ['available-slots', selectedDate.toISOString().split('T')[0]],
      () => fetchAvailableSlots(selectedDate)
    );

    return (
      <div className="space-y-4">
        {/* Date Picker */}
        <div>
          <label>Select Date</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            max={getMaxDate()}
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>

        {/* Time Slot Grid */}
        <div>
          <label>Select Time</label>
          <div className="grid grid-cols-4 gap-2">
            {isLoading ? (
              <div>Loading available times...</div>
            ) : (
              slots?.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => {
                    setSelectedTime(slot.time);
                    onTimeSelect(slot.datetime);
                  }}
                  disabled={!slot.available}
                  className={`
                    p-3 rounded border
                    ${!slot.available ? 'bg-gray-100 cursor-not-allowed' : ''}
                    ${selectedTime === slot.time ? 'bg-blue-500 text-white' : ''}
                  `}
                >
                  <div className="font-medium">{slot.time}</div>
                  <div className="text-xs">
                    {slot.available
                      ? `${slot.maxOrders - slot.ordersCount} spots`
                      : 'Full'}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ASAP Option */}
        <button
          onClick={() => {
            setSelectedTime(null);
            onTimeSelect(null);
          }}
          className={`
            w-full p-3 rounded border
            ${selectedTime === null ? 'bg-blue-500 text-white' : ''}
          `}
        >
          ASAP (Ready in 15-20 minutes)
        </button>
      </div>
    );
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 7);
    return max.toISOString().split('T')[0];
  };
  ```

### 8. Update Checkout Page
- [ ] Modify `customer-frontend/src/pages/CheckoutPage.tsx`
  ```typescript
  import { SchedulingTimePicker } from '../components/SchedulingTimePicker';

  export const CheckoutPage = () => {
    const [scheduledTime, setScheduledTime] = useState<Date | null>(null);

    const handleSubmit = async () => {
      const orderData = {
        // ... existing order data
        scheduled_time: scheduledTime?.toISOString(),
      };

      await createOrder(orderData);
    };

    return (
      <div>
        {/* Existing checkout fields */}

        {/* Scheduling Section */}
        <div className="border rounded-lg p-4">
          <h3>Pickup Time</h3>
          <SchedulingTimePicker onTimeSelect={setScheduledTime} />

          {scheduledTime && (
            <div className="mt-2 p-3 bg-blue-50 rounded">
              <strong>Scheduled for:</strong>{' '}
              {scheduledTime.toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        {/* Submit button */}
      </div>
    );
  };
  ```

### 9. Employee Dashboard - Scheduled Orders View
- [ ] Create `employee-dashboard/src/pages/ScheduledOrdersPage.tsx`
  ```typescript
  export const ScheduledOrdersPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { data: orders } = useQuery(
      ['scheduled-orders', selectedDate],
      () => fetchScheduledOrders(selectedDate)
    );

    return (
      <div className="p-6">
        <h1>Scheduled Orders</h1>

        {/* Date Selector */}
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />

        {/* Timeline View */}
        <div className="mt-6">
          {orders?.length === 0 ? (
            <p>No scheduled orders for this date</p>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold">
                        {new Date(order.scheduled_time).toLocaleTimeString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Order #{order.id} - {order.guest_name || order.user_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${order.total}</div>
                      <div className="text-sm">
                        {order.items.length} items
                      </div>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="mt-2">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.menu_item_name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  ```

### 10. Reminder Notifications
- [ ] Create `backend/src/jobs/orderReminders.ts`
  ```typescript
  import cron from 'node-cron';

  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 15 * 60 * 1000);

    // Find orders scheduled in next 15 minutes that haven't been reminded
    const result = await pool.query(`
      SELECT *
      FROM orders
      WHERE is_scheduled = true
        AND reminder_sent = false
        AND scheduled_time BETWEEN $1 AND $2
    `, [now, reminderTime]);

    for (const order of result.rows) {
      // Send reminder (email/SMS)
      await emailService.sendPickupReminder(order);

      // Mark as sent
      await pool.query(
        'UPDATE orders SET reminder_sent = true WHERE id = $1',
        [order.id]
      );
    }
  });
  ```

### 11. Testing
- [ ] Test slot availability calculation
- [ ] Test capacity limits (booking when slot full)
- [ ] Test validation (too soon, too far, outside hours)
- [ ] Test scheduled order display in employee dashboard
- [ ] Test reminder notifications
- [ ] Test timezone handling

## Success Criteria
- [x] Customers can schedule orders up to 7 days ahead
- [x] Time slots show available capacity
- [x] Full slots cannot be booked
- [x] Business hours validation works
- [x] Minimum 30-minute advance notice enforced
- [x] Employee dashboard shows scheduled orders by date
- [x] Reminders sent 15 minutes before pickup
- [x] ASAP option still available

## Files to Create
- `backend/src/config/schema-scheduling.sql`
- `backend/src/models/BusinessHours.ts`
- `backend/src/controllers/schedulingController.ts`
- `backend/src/routes/schedulingRoutes.ts`
- `backend/src/jobs/orderReminders.ts`
- `customer-frontend/src/components/SchedulingTimePicker.tsx`
- `employee-dashboard/src/pages/ScheduledOrdersPage.tsx`

## Files to Modify
- `backend/src/models/Order.ts`
- `backend/src/controllers/orderController.ts`
- `backend/src/server.ts`
- `customer-frontend/src/pages/CheckoutPage.tsx`

## Dependencies
- node-cron (for reminders)

## Future Enhancements
- Dynamic pricing (surge pricing for rush hours)
- Catering order form (large quantities)
- Calendar sync (iCal, Google Calendar)
- Multiple pickup locations
- Delivery time estimation
- Buffer time between orders
