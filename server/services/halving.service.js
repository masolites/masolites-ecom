import MiningRate from '../models/miningrate.model.js';
import { notifyEvents } from './notification.service.js';

const HALVING_INTERVAL = 90; // Days
const HALVING_RATE = 0.5; // 50% reduction

export const checkHalving = async () => {
  const latestRate = await MiningRate.findOne().sort({ date: -1 });
  const today = new Date();
  
  if (!latestRate || (today - latestRate.date) / (1000 * 60 * 60 * 24) >= HALVING_INTERVAL) {
    const newRate = latestRate ? latestRate.rate * HALVING_RATE : 0.05;
    
    await new MiningRate({
      rate: newRate,
      date: today
    }).save();
    
    // Notify users
    const users = await User.find();
    users.forEach(user => {
      notifyEvents.MINING_RATE_CHANGE(
        user._id,
        `Mining rate halved to ${newRate} MZLx/min`
      );
    });
    
    return true;
  }
  
  return false;
};

// Run daily
setInterval(checkHalving, 24 * 60 * 60 * 1000);
