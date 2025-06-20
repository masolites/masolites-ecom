import User from '../models/user.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';

const LEVEL_COMMISSION = 0.025; // 2.5% per level
const MAX_LEVELS = 5;

export const trackReferral = async (userId, referrerId) => {
  const user = await User.findById(userId);
  if (!user.referredBy && referrerId) {
    user.referredBy = referrerId;
    await user.save();
    
    // Award referral bonuses
    let currentUpline = referrerId;
    let level = 1;
    
    while (currentUpline && level <= MAX_LEVELS) {
      const rewardAmount = level === 1 ? 100 * LEVEL_COMMISSION : 50 * LEVEL_COMMISSION;
      
      await Wallet.updateOne(
        { userId: currentUpline },
        { $inc: { 'balances.MZLx': rewardAmount } }
      );
      
      await new Transaction({
        userId: currentUpline,
        type: 'referral_reward',
        amount: rewardAmount,
        currency: 'MZLx',
        status: 'completed'
      }).save();
      
      // Move to next upline
      const uplineUser = await User.findById(currentUpline);
      currentUpline = uplineUser.referredBy;
      level++;
    }
  }
};

export const getDownline = async (userId) => {
  return User.aggregate([
    { $match: { referredBy: userId } },
    {
      $graphLookup: {
        from: 'users',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'referredBy',
        as: 'downline',
        maxDepth: 4
      }
    }
  ]);
};
