# WeeYan Platform User Testing Plan

## 1. Testing Objectives
- Validate core functionality flows
- Identify UX friction points
- Test scalability under load
- Verify security measures

## 2. Participant Recruitment
- Recruit 200 beta testers through:
  - Crypto communities (50%)
  - Social media influencers (20%)
  - Existing user base (30%)
- Include both technical and non-technical users

## 3. Test Cases

### Core Functionality
- [ ] Wallet creation and funding
- [ ] Token purchase flow
- [ ] Content creation and sharing
- [ ] Mining rewards calculation
- [ ] Live streaming interaction

### Security Features
- [ ] 4-digit PIN protection
- [ ] Session timeout
- [ ] Withdrawal confirmation

### Performance
- [ ] 100 concurrent live streams
- [ ] 10,000 simultaneous users
- [ ] Transaction processing under load

## 4. Feedback Collection
```javascript
// server/routes/feedback.js
router.post('/submit', async (req, res) => {
  const feedback = new Feedback({
    user: req.userId,
    category: req.body.category,
    rating: req.body.rating,
    comments: req.body.comments,
    screenshots: req.body.screenshots
  });
  
  await feedback.save();
  
  // Reward testers with tokens
  await Wallet.updateOne(
    { user: req.userId },
    { $inc: { 'balances.MZLx': 50 } }
  );
  
  res.json({ success: true });
});
