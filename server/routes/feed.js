import express from 'express';
import Post from '../models/post.model.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Get feed
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { videoUrl, caption } = req.body;
    
    const post = new Post({
      user: req.userId,
      videoUrl,
      caption,
      likes: 0,
      comments: []
    });
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like a post
router.post('/like/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    // Record engagement for mining
    await recordEngagement(req.userId, 'like');
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record gift
router.post('/gift', authMiddleware, async (req, res) => {
  try {
    const { videoId, amount } = req.body;
    
    // Update creator's balance
    const video = await Post.findById(videoId).populate('user');
    await Wallet.updateOne(
      { userId: video.user._id },
      { $inc: { 'balances.MZLx': amount } }
    );
    
    // Record transaction
    await new Transaction({
      userId: req.userId,
      recipient: video.user._id,
      type: 'content_gift',
      amount,
      currency: 'MZLx',
      status: 'completed'
    }).save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
