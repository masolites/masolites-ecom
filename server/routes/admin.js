 import express from 'express';
import ManualDeposit from '../models/manualdeposit.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';

const router = express.Router();

// Get pending manual deposits
router.get('/deposits/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deposits = await ManualDeposit.find({ status: 'pending' })
      .populate('userId', 'username email');
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve manual deposit
router.post('/deposits/approve/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deposit = await ManualDeposit.findById(req.params.id);
    
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
    
    // Update wallet
    await Wallet.updateOne(
      { userId: deposit.userId },
      { $inc: { 
        'balances.NGN': deposit.amount,
        'balances.MZLx': deposit.tokenAmount || 0
      }}
    );
    
    // Update deposit status
    deposit.status = 'approved';
    await deposit.save();
    
    // Create transaction record
    await new Transaction({
      userId: deposit.userId,
      type: 'manual_deposit',
      amount: deposit.tokenAmount || deposit.amount,
      currency: deposit.tokenAmount ? 'MZLx' : deposit.currency,
      status: 'completed',
      txHash: deposit.reference
    }).save();
    
    res.json({ message: 'Deposit approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject manual deposit
router.post('/deposits/reject/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deposit = await ManualDeposit.findById(req.params.id);
    
    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
    
    deposit.status = 'rejected';
    await deposit.save();
    
    res.json({ message: 'Deposit rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
