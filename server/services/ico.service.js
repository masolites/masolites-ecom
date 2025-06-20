import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import { distributeTokens } from './token.service.js';

// Token price calculation
const calculateTokenPrice = (daysLeft) => {
  const basePrice = 0.001;
  const targetPrice = 0.75;
  const progress = (120 - daysLeft) / 120;
  
  // Linear price increase during ICO
  if (daysLeft > 0) {
    return basePrice + (targetPrice - basePrice) * progress;
  }
  
  // Post-ICO voting mechanism would go here
  return targetPrice;
};

// Get current ICO data
export const getICOData = async () => {
  const icoStartDate = new Date('2023-10-01');
  const today = new Date();
  const diffTime = icoStartDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    currentPrice: calculateTokenPrice(daysLeft),
    daysLeft: daysLeft > 0 ? daysLeft : 0,
    tokensSold: await getTokensSold(),
    tokensAvailable: 25000000 - await getTokensSold()
  };
};

// Process token purchase
export const processTokenPurchase = async (
  address,
  tokenAmount,
  paymentMethod,
  userId
) => {
  // Get current price
  const { currentPrice } = await getICOData();
  const amountInUSD = tokenAmount * currentPrice;
  
  // Create transaction record
  const transaction = new Transaction({
    userId,
    type: 'ico_purchase',
    amount: tokenAmount,
    currency: 'MZLx',
    paymentMethod,
    status: paymentMethod === 'manual' ? 'pending' : 'completed'
  });
  
  await transaction.save();
  
  // Distribute tokens (if not manual payment)
  if (paymentMethod !== 'manual') {
    await distributeTokens(userId, tokenAmount, true);
  }
  
  return {
    success: true,
    transactionId: transaction._id,
    amount: tokenAmount,
    price: currentPrice,
    totalPaid: amountInUSD
  };
};

// Get total tokens sold
const getTokensSold = async () => {
  const result = await Transaction.aggregate([
    { $match: { type: 'ico_purchase', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};
