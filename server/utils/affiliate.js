// 5-level deep affiliate rewards
const REWARD_PERCENTAGES = [0.025, 0.025, 0.025, 0.025, 0.025];

async function distributeAffiliateRewards(userId, purchaseAmount) {
  let currentUser = await User.findById(userId);
  let rewards = [];
  
  for (let level = 0; level < 5; level++) {
    if (!currentUser.referredBy) break;
    
    const referrer = await User.findById(currentUser.referredBy);
    const rewardAmount = purchaseAmount * REWARD_PERCENTAGES[level];
    
    // Distribute MZLx tokens
    await CreditCrypto(referrer._id, rewardAmount, 'MZLx');
    
    rewards.push({
      level: level+1,
      userId: referrer._id,
      amount: rewardAmount
    });
    
    currentUser = referrer;
  }
  
  return rewards;
