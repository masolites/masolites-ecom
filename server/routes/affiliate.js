import express from 'express';
import { trackReferral, getDownline } from '../services/mlm.service.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Track referral
router.get('/track', async (req, res) => {
  const { userId, ref } = req.query;
  
  if (userId && ref) {
    await trackReferral(userId, ref);
  }
  
  res.redirect('/signup');
});

// Get downline
router.get('/downline', authMiddleware, async (req, res) => {
  try {
    const downline = await getDownline(req.userId);
    res.json(downline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get referral link
router.get('/link', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ link: `https://weeyan.com/signup?ref=${user.referralCode}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
