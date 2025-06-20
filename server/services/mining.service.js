import MiningSession from '../models/miningsession.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';

// Base mining rates
const BASE_RATE = 0.1; // MZLx per minute for Silver
const GOLD_MULTIPLIER = 2;
const POWER_MEMBER_MULTIPLIER = 1.25;

// Engagement multipliers
const MULTIPLIERS = {
  watchAd: 1.1,
  like: 1.05,
  comment: 1.07,
  share: 1.15,
  repost: 1.2,
  liveParticipation: 1.3
};

// Start a mining session
export const startMiningSession = async (userId) => {
  // End any existing session
  await MiningSession.updateOne(
    { userId, endTime: null },
    { $set: { endTime: new Date() } }
  );

  // Start new session
  const session = new MiningSession({
    userId,
    startTime: new Date()
  });
  await session.save();
};

// End a mining session and calculate rewards
export const endMiningSession = async (userId) => {
  const session = await MiningSession.findOne({ userId, endTime: null });
  if (!session) throw new Error('No active mining session');

  session.endTime = new Date();
  await session.save();

  // Calculate rewards
  const rewards = await calculateMiningRewards(userId, session.startTime, session.endTime);
  
  // Credit wallet
  await Wallet.updateOne(
    { userId },
    { $inc: { 'balances.MZLx': rewards } }
  );

  // Record transaction
  await new Transaction({
    userId,
    type: 'mining_reward',
    amount: rewards,
    currency: 'MZLx',
    status: 'completed'
  }).save();

  return rewards;
};

// Calculate rewards for a session
const calculateMiningRewards = async (userId, startTime, endTime) => {
  const user = await User.findById(userId);
  const wallet = await Wallet.findOne({ userId });
  
  // Base mining rate
  let rate = BASE_RATE;
  
  // Apply Gold miner multiplier
  if (wallet.isGold) rate *= GOLD_MULTIPLIER;
  
  // Apply Power member multiplier
  if (user.isPowerMember) rate *= POWER_MEMBER_MULTIPLIER;

  // Fetch engagement data (simplified - would come from real-time tracking)
  const engagement = await getEngagementData(userId, startTime, endTime);
  
  // Apply engagement multipliers
  Object.keys(engagement).forEach(action => {
    if (engagement[action] > 0 && MULTIPLIERS[action]) {
      rate *= MULTIPLIERS[action];
    }
  });

  // Calculate minutes
  const minutes = (endTime - startTime) / 60000;
  
  return rate * minutes;
};

// Mock engagement data (implement real tracking in future)
const getEngagementData = async (userId, startTime, endTime) => {
  // In reality, we'd query engagement events from the database
  return {
    watchAd: 3,
    like: 10,
    comment: 5,
    share: 2,
    repost: 1,
    liveParticipation: 0
  };
};

// Upgrade to Gold status
export const upgradeToGold = async (userId) => {
  await Wallet.updateOne({ userId }, { isGold: true });
  await User.updateOne({ _id: userId }, { minerStatus: 'gold' });
};
