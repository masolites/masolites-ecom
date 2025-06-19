// Multi-tiered mining rewards system
const MINING_RATES = {
  SILVER: {
    watch: 0.001,
    like: 0.002,
    comment: 0.003,
    share: 0.005,
    repost: 0.008
  },
  GOLD: {
    watch: 0.003,
    like: 0.005,
    comment: 0.008,
    share: 0.01,
    repost: 0.015,
    liveParticipation: 0.03
  }
};

function calculateMiningReward(user, actions) {
  const minerType = user.minerStatus;
  let totalReward = 0;
  
  actions.forEach(action => {
    totalReward += MINING_RATES[minerType][action.type] * action.count;
  });
  
  // Apply engagement multiplier
  const engagementMultiplier = 1 + (user.engagementScore * 0.01);
  return totalReward * engagementMultiplier;
