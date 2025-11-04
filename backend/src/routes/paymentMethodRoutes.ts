import { Router } from 'express';
import {
  getPaymentMethods,
  createSetupIntent,
  savePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
} from '../controllers/paymentMethodController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All payment method routes require authentication
router.use(authenticateToken);

router.get('/', getPaymentMethods);
router.post('/setup-intent', createSetupIntent);
router.post('/', savePaymentMethod);
router.put('/:id/default', setDefaultPaymentMethod);
router.delete('/:id', deletePaymentMethod);

export default router;
