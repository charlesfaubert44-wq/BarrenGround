import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getOrderByToken,
  getUserOrders,
  getOrdersByStatus,
  updateOrderStatus,
  updateCustomerStatus,
  getRecentOrders,
  getLastOrder,
  createOrderValidation,
  updateOrderStatusValidation,
} from '../controllers/orderController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { requireEmployee } from '../middleware/roleAuth';

const router = Router();

// Create order (guest or authenticated)
router.post('/', optionalAuth, createOrderValidation, createOrder);

// Get order by tracking token (public, for guests)
router.get('/track/:token', getOrderByToken);

// Update customer status by tracking token (public, for guests and users)
router.put('/track/:trackingToken/customer-status', updateCustomerStatus);

// Get user's orders (authenticated)
router.get('/my-orders', authenticateToken, getUserOrders);

// Get user's last order for repeat functionality (authenticated)
router.get('/last-order', authenticateToken, getLastOrder);

// Get orders by status (employee dashboard)
router.get('/', authenticateToken, requireEmployee, getOrdersByStatus);

// Get recent orders (employee dashboard)
router.get('/recent', authenticateToken, requireEmployee, getRecentOrders);

// Get single order (employee dashboard)
router.get('/:id', authenticateToken, requireEmployee, getOrder);

// Update order status (employee)
router.put('/:id/status', authenticateToken, requireEmployee, updateOrderStatusValidation, updateOrderStatus);

export default router;
