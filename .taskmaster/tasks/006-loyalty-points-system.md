# Implement Loyalty Points System

**Priority:** 🌟 HIGH-VALUE FEATURE
**Phase:** 2 - High-Value Features
**Estimated Time:** 6-8 hours
**Impact:** +25-40% repeat customers, +15-20% revenue
**Status:** pending

## Description
Implement a points-based loyalty program separate from the paid membership. Customers earn points on purchases and redeem them for discounts.

## Business Rules
- Earn 1 point per $1 spent
- 100 points = $5 credit
- Points never expire
- Bonus points: Birthday (50 pts), Referral (100 pts)
- Can combine points with membership discounts
- Minimum redemption: 100 points

## Tasks

### 1. Database Schema
- [ ] Create migration `backend/src/config/schema-loyalty.sql`
  ```sql
  CREATE TABLE loyalty_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    points_earned INTEGER DEFAULT 0,
    points_spent INTEGER DEFAULT 0,
    balance_after INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'redeem', 'bonus', 'adjustment'
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_loyalty_user ON loyalty_transactions(user_id, created_at DESC);
  CREATE INDEX idx_loyalty_order ON loyalty_transactions(order_id);

  -- Add points balance to users table for quick access
  ALTER TABLE users ADD COLUMN loyalty_points INTEGER DEFAULT 0;
  CREATE INDEX idx_users_points ON users(loyalty_points);

  -- Track birthday for bonus points
  ALTER TABLE users ADD COLUMN date_of_birth DATE;
  ```

- [ ] Run migration

### 2. Create Model
- [ ] Create `backend/src/models/LoyaltyTransaction.ts`
  ```typescript
  export interface LoyaltyTransaction {
    id: number;
    user_id: number;
    order_id?: number;
    points_earned: number;
    points_spent: number;
    balance_after: number;
    transaction_type: 'earn' | 'redeem' | 'bonus' | 'adjustment';
    description: string;
    created_at: Date;
  }

  export class LoyaltyTransaction {
    static async getUserBalance(userId: number): Promise<number> {
      // Get current points balance from users table
    }

    static async getUserHistory(userId: number): Promise<LoyaltyTransaction[]> {
      // Get transaction history
    }

    static async earnPoints(
      userId: number,
      orderId: number,
      amount: number,
      description: string
    ): Promise<LoyaltyTransaction> {
      // Calculate points (1 point per dollar)
      // Create transaction
      // Update user balance
    }

    static async redeemPoints(
      userId: number,
      points: number,
      orderId?: number
    ): Promise<{ success: boolean; creditAmount: number }> {
      // Validate sufficient balance
      // Calculate credit amount (100 pts = $5)
      // Create transaction
      // Update user balance
      // Return credit amount
    }

    static async addBonusPoints(
      userId: number,
      points: number,
      type: 'birthday' | 'referral' | 'promotion',
      description: string
    ): Promise<LoyaltyTransaction> {
      // Add bonus points
    }

    static async getPointsValue(points: number): Promise<number> {
      // Convert points to dollar value
      // 100 points = $5
      return (points / 100) * 5;
    }
  }
  ```

### 3. Create Controller
- [ ] Create `backend/src/controllers/loyaltyController.ts`
  ```typescript
  export const getBalance = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const balance = await LoyaltyTransaction.getUserBalance(userId);

    res.json({
      points: balance,
      value: await LoyaltyTransaction.getPointsValue(balance),
    });
  };

  export const getHistory = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const history = await LoyaltyTransaction.getUserHistory(userId);

    res.json({ history });
  };

  export const redeemPoints = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { points } = req.body;

    // Validate minimum redemption
    if (points < 100) {
      return res.status(400).json({
        error: 'Minimum redemption is 100 points',
      });
    }

    const result = await LoyaltyTransaction.redeemPoints(userId, points);

    if (!result.success) {
      return res.status(400).json({
        error: 'Insufficient points',
      });
    }

    res.json({
      success: true,
      creditAmount: result.creditAmount,
    });
  };

  export const checkBirthdayBonus = async (req: Request, res: Response) => {
    // Check if user's birthday is today
    // Award 50 bonus points if not already awarded this year
  };
  ```

### 4. Update Order Controller
- [ ] Modify `backend/src/controllers/orderController.ts`
  ```typescript
  // In createOrder function:

  export const createOrder = async (req: Request, res: Response) => {
    // ... existing order creation logic

    // After payment confirmed:
    if (req.user) {
      // Award points (1 point per dollar spent)
      const pointsToEarn = Math.floor(orderTotal);
      await LoyaltyTransaction.earnPoints(
        req.user.id,
        order.id,
        pointsToEarn,
        `Purchase - Order #${order.id}`
      );
    }

    // Handle points redemption if requested
    if (req.body.redeem_points) {
      const { points } = req.body.redeem_points;
      const result = await LoyaltyTransaction.redeemPoints(
        req.user.id,
        points,
        order.id
      );

      if (result.success) {
        // Apply credit to order
        order.total -= result.creditAmount;
        // Update order in database
      }
    }

    // ... return response
  };
  ```

### 5. Create Routes
- [ ] Create `backend/src/routes/loyaltyRoutes.ts`
  ```typescript
  import { Router } from 'express';
  import * as loyaltyController from '../controllers/loyaltyController';
  import { authenticateToken } from '../middleware/auth';

  const router = Router();

  // All routes require authentication
  router.use(authenticateToken);

  router.get('/balance', loyaltyController.getBalance);
  router.get('/history', loyaltyController.getHistory);
  router.post('/redeem', loyaltyController.redeemPoints);
  router.post('/check-birthday', loyaltyController.checkBirthdayBonus);

  export default router;
  ```

- [ ] Register in `backend/src/server.ts`
  ```typescript
  import loyaltyRoutes from './routes/loyaltyRoutes';
  app.use('/api/loyalty', loyaltyRoutes);
  ```

### 6. Frontend - Loyalty Page
- [ ] Create `customer-frontend/src/pages/LoyaltyPage.tsx`
  ```typescript
  export const LoyaltyPage = () => {
    const { data: balance } = useQuery(['loyalty-balance'], fetchBalance);
    const { data: history } = useQuery(['loyalty-history'], fetchHistory);

    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1>Loyalty Rewards</h1>

        {/* Points Balance Card */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg p-8 text-white">
          <h2>Your Points Balance</h2>
          <div className="text-5xl font-bold">{balance?.points || 0}</div>
          <p className="text-lg">≈ ${balance?.value || 0} in rewards</p>

          {/* Progress to next reward */}
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Next Reward</span>
              <span>{100 - (balance?.points % 100)} points away</span>
            </div>
            <ProgressBar value={balance?.points % 100} max={100} />
          </div>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <h3>Earn Points</h3>
            <p>1 point per $1 spent</p>
          </div>
          <div className="text-center">
            <h3>Redeem Rewards</h3>
            <p>100 points = $5 off</p>
          </div>
          <div className="text-center">
            <h3>Bonus Points</h3>
            <p>Birthdays, referrals, and more</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-8">
          <h2>Points History</h2>
          <div className="space-y-2">
            {history?.map((tx) => (
              <div key={tx.id} className="flex justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">{tx.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={tx.points_earned > 0 ? 'text-green-600' : 'text-red-600'}>
                  {tx.points_earned > 0 ? '+' : '-'}
                  {tx.points_earned || tx.points_spent} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  ```

### 7. Frontend - Points Display Component
- [ ] Create `customer-frontend/src/components/PointsDisplay.tsx`
  ```typescript
  export const PointsDisplay = () => {
    const { data: balance } = useQuery(['loyalty-balance'], fetchBalance);

    if (!balance) return null;

    return (
      <div className="flex items-center gap-2">
        <StarIcon className="w-5 h-5 text-yellow-500" />
        <span className="font-medium">{balance.points} points</span>
      </div>
    );
  };
  ```

- [ ] Add to header navigation
  ```typescript
  // In Header.tsx or Navigation.tsx
  import { PointsDisplay } from './PointsDisplay';

  <div className="flex items-center gap-4">
    <PointsDisplay />
    <CartButton />
    <UserMenu />
  </div>
  ```

### 8. Frontend - Checkout Integration
- [ ] Update `customer-frontend/src/pages/CheckoutPage.tsx`
  ```typescript
  // Add points redemption option
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const { data: balance } = useQuery(['loyalty-balance'], fetchBalance);

  const maxRedeemable = Math.min(
    Math.floor(balance?.points / 100) * 100, // Round down to nearest 100
    Math.floor(orderTotal / 5) * 100 // Max 100% discount
  );

  return (
    <div>
      {/* Existing checkout form */}

      {/* Points Redemption Section */}
      {balance && balance.points >= 100 && (
        <div className="border rounded-lg p-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={redeemPoints}
              onChange={(e) => setRedeemPoints(e.target.checked)}
            />
            <span>Use loyalty points</span>
          </label>

          {redeemPoints && (
            <div className="mt-4">
              <label>Points to redeem (min 100)</label>
              <input
                type="range"
                min={100}
                max={maxRedeemable}
                step={100}
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(Number(e.target.value))}
              />
              <div className="flex justify-between">
                <span>{pointsToRedeem} points</span>
                <span className="text-green-600">
                  -${(pointsToRedeem / 100) * 5}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Updated total */}
      <div className="font-bold text-xl">
        Total: ${calculateTotal() - (redeemPoints ? (pointsToRedeem / 100) * 5 : 0)}
      </div>
    </div>
  );
  ```

### 9. Birthday Bonus Automation
- [ ] Create `backend/src/jobs/birthdayBonus.ts`
  ```typescript
  import cron from 'node-cron';

  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Checking for birthday bonuses...');

    const result = await pool.query(`
      SELECT id, email, name
      FROM users
      WHERE EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
        AND NOT EXISTS (
          SELECT 1 FROM loyalty_transactions
          WHERE user_id = users.id
            AND transaction_type = 'bonus'
            AND description LIKE 'Birthday bonus%'
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        )
    `);

    for (const user of result.rows) {
      await LoyaltyTransaction.addBonusPoints(
        user.id,
        50,
        'birthday',
        `Birthday bonus ${new Date().getFullYear()}`
      );

      // Send birthday email
      console.log(`Awarded birthday bonus to ${user.email}`);
    }
  });
  ```

- [ ] Import in `server.ts`

### 10. Testing
- [ ] Test earning points on order
- [ ] Test redeeming points at checkout
- [ ] Test points history display
- [ ] Test birthday bonus automation
- [ ] Test validation (minimum redemption, insufficient balance)
- [ ] Test edge cases (negative points, decimal points)

## Success Criteria
- [x] Users earn 1 point per dollar spent
- [x] Users can view points balance and history
- [x] Users can redeem 100 points for $5 at checkout
- [x] Birthday bonus awarded automatically
- [x] Points display in header
- [x] Points don't expire
- [x] Transaction history is accurate

## Files to Create
- `backend/src/config/schema-loyalty.sql`
- `backend/src/models/LoyaltyTransaction.ts`
- `backend/src/controllers/loyaltyController.ts`
- `backend/src/routes/loyaltyRoutes.ts`
- `backend/src/jobs/birthdayBonus.ts`
- `customer-frontend/src/pages/LoyaltyPage.tsx`
- `customer-frontend/src/components/PointsDisplay.tsx`

## Files to Modify
- `backend/src/server.ts` (register routes and jobs)
- `backend/src/controllers/orderController.ts` (award points)
- `customer-frontend/src/pages/CheckoutPage.tsx` (redemption)
- `customer-frontend/src/components/Header.tsx` (points display)

## Dependencies
- node-cron (for birthday automation)

## Future Enhancements
- Tiered rewards (Bronze/Silver/Gold based on points)
- Double points promotions
- Points expiration after 1 year
- Gift points to friends
- Points for reviews/referrals
