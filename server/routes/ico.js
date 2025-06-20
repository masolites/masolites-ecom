import express from 'express';
import {
  getICOData,
  processTokenPurchase,
  getTokenPriceHistory
} from '../services/ico.service.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Get current ICO data
router.get('/data', async (req, res) => {
  try {
    const icoData = await getICOData();
    res.json(icoData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process token purchase
router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { address, tokenAmount, paymentMethod } = req.body;
    const result = await processTokenPurchase(
      address,
      tokenAmount,
      paymentMethod,
      req.userId
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Token price history (for charts)
router.get('/price-history', async (req, res) => {
  try {
    const history = await getTokenPriceHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
