import axios from 'axios';
import User from '../server/models/user.model.js';
import { notifyEvents } from '../server/services/notification.service.js';

// 1. Airdrop campaign for early adopters
export const launchAirdrop = async () => {
  const earlyUsers = await User.find({ joinDate: { $lt: new Date('2023-10-01') } });
  
  for (const user of earlyUsers) {
    await axios.post('/api/wallet/credit', {
      userId: user._id,
      amount: 100,
      currency: 'MZLx',
      reason: 'Early adopter airdrop'
    });
    
    notifyEvents.AIRDROP(user._id, '100 MZLx early adopter reward!');
  }
};

// 2. Affiliate program activation
export const activateAffiliateProgram = async () => {
  await axios.put('/api/admin/settings', {
    affiliateProgram: true,
    affiliateRewardRate: 0.025
  });
  
  // Notify eligible users
  const eligibleUsers = await User.find({ 'wallet.balances.MZLx': { $gte: 100 } });
  eligibleUsers.forEach(user => {
    notifyEvents.AFFILIATE_PROGRAM(
      user._id,
      'Affiliate program launched - earn 2.5% on referrals!'
    );
  });
};

// 3. Social media campaign
export const launchSocialMediaCampaign = () => {
  const platforms = ['twitter', 'telegram', 'discord', 'tiktok'];
  
  platforms.forEach(platform => {
    axios.post('/api/marketing/social', {
      platform,
      message: `🚀 WeeYan is LIVE! 
                Join the social revolution powered by $MZLx 
                ✅ TikTok-style videos
                ✅ Earn crypto rewards
                ✅ Private sale ongoing
                👉 https://weeyan.com?ref=launch`
    });
  });
};

// 4. Execute full launch
export const executeLaunch = async () => {
  console.log('Launching WeeYan marketing campaign...');
  
  await launchAirdrop();
  await activateAffiliateProgram();
  launchSocialMediaCampaign();
  
  // Activate ICO countdown
  await axios.post('/api/ico/start', {
    startDate: new Date(),
    duration: 120,
    initialPrice: 0.001
  });
  
  console.log('Marketing launch complete!');
};

executeLaunch();
