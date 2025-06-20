import mongoose from 'mongoose';

const ManualDepositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['NGN', 'USD'], default: 'NGN' },
  tokenAmount: { type: Number },
  reference: { type: String, required: true },
  proofUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ManualDeposit', ManualDepositSchema);
