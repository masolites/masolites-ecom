import express from 'express';
import { 
  initiateFlutterwavePayment,
  handleFlutterwaveWebhook
} from '../services/payment.service.js';
import ManualDeposit from '../models/manualdeposit.model.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Flutterwave payment initiation
router.post('/flutterwave', authMiddleware, async (req, res) => {
  try {
    const { amount, tokenAmount } = req.body;
    const paymentLink = await initiateFlutterwavePayment(
      req.userId, 
      amount, 
      tokenAmount
    );
    res.json({ paymentLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Flutterwave webhook
router.post('/flutterwave/webhook', async (req, res) => {
  try {
    const result = await handleFlutterwaveWebhook(req.body);
    if (result) return res.status(200).send('OK');
    res.status(400).send('Invalid payload');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Manual deposit request
router.post('/manual', authMiddleware, async (req, res) => {
  try {
    const { amount
