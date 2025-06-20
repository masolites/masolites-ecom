import mongoose from 'mongoose';

const MiningSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  rewards: { type: Number }
}, { timestamps: true });

export default mongoose.model('MiningSession', MiningSessionSchema);
