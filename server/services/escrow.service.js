import Escrow from '../models/escrow.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';

export const createEscrow = async (buyerId, sellerId, amount, token, details) => {
  // Lock tokens in escrow
  await Wallet.updateOne(
    { userId: buyerId },
    { $inc: { [`balances.${token}`]: -amount } }
  );
  
  const escrow = new Escrow({
    buyer: buyerId,
    seller: sellerId,
    amount,
    token,
    details,
    status: 'pending'
  });
  
  await escrow.save();
  
  return escrow;
};

export const releaseEscrow = async (escrowId) => {
  const escrow = await Escrow.findById(escrowId);
  
  // Transfer to seller
  await Wallet.updateOne(
    { userId: escrow.seller },
    { $inc: { [`balances.${escrow.token}`]: escrow.amount } }
  );
  
  // Update status
  escrow.status = 'completed';
  await escrow.save();
  
  // Record transaction
  await new Transaction({
    userId: escrow.buyer,
    recipient: escrow.seller,
    type: 'escrow_release',
    amount: escrow.amount,
    currency: escrow.token,
    status: 'completed'
  }).save();
};

export const cancelEscrow = async (escrowId) => {
  const escrow = await Escrow.findById(escrowId);
  
  // Return to buyer
  await Wallet.updateOne(
    { userId: escrow.buyer },
    { $inc: { [`balances.${escrow.token}`]: escrow.amount } }
  );
  
  // Update status
  escrow.status = 'cancelled';
  await escrow.save();
};
