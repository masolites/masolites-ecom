import flw from 'flutterwave-node-v3';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';

const flutterwave = new flw(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

export const initiateFlutterwavePayment = async (userId, amount, tokenAmount) => {
  const userWallet = await Wallet.findOne({ userId });
  
  const response = await flutterwave.Payment.initiate({
    tx_ref: `WEEYAN-${Date.now()}-${userId}`,
    amount: amount * 1500, // USD to NGN
    currency: 'NGN',
    payment_options: 'card, banktransfer',
    customer: {
      email: userWallet.email,
      name: userWallet.username
    },
    customizations: {
      title: 'MAZOL Token Purchase',
      description: `${tokenAmount} MZLx tokens`
    },
    meta: {
      userId,
      tokenAmount,
      purchaseType: 'ico'
    }
  });
  
  return response.data.link;
};

export const handleFlutterwaveWebhook = async (payload) => {
  if (payload.status === 'successful') {
    const userId = payload.meta.userId;
    const tokenAmount = payload.meta.tokenAmount;
    
    await Wallet.updateOne(
      { userId },
      { $inc: { 'balances.MZLx': tokenAmount } }
    );
    
    await new Transaction({
      userId,
      type: 'ico_purchase',
      amount: tokenAmount,
      currency: 'MZLx',
      status: 'completed',
      txHash: payload.id
    }).save();
    
    return true;
  }
  return false;
};
