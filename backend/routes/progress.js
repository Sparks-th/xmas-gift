const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user progress
router.get('/progress/:sessionId', async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });
    if (!user) {
      return res.json({ exists: false });
    }
    res.json({
      exists: true,
      currentStep: user.currentStep,
      spinData: user.spinData,
      shareProgress: user.shareProgress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save/Update user progress
router.post('/progress', async (req, res) => {
  try {
    const { sessionId, currentStep, data } = req.body;
    
    let user = await User.findOne({ sessionId });
    
    if (!user) {
      user = new User({
        sessionId,
        ipAddress: req.clientIp,
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer || req.headers.referrer
      });
    }
    
    user.currentStep = currentStep;
    user.lastActivity = new Date();
    
    // Update specific data based on step
    if (data) {
      if (data.phoneNumber) user.phoneNumber = data.phoneNumber;
      if (data.email) user.email = data.email;
      if (data.hasPalmpayAccount !== undefined) user.hasPalmpayAccount = data.hasPalmpayAccount;
      if (data.appliedLastYear !== undefined) user.appliedLastYear = data.appliedLastYear;
      if (data.gender) user.gender = data.gender;
      if (data.ageRange) user.ageRange = data.ageRange;
      if (data.spinData) user.spinData = data.spinData;
      if (data.shareProgress) user.shareProgress = data.shareProgress;
      if (data.completed) user.completed = data.completed;
    }
    
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track spin attempt
router.post('/spin', async (req, res) => {
  try {
    const { sessionId, result } = req.body;
    
    const user = await User.findOne({ sessionId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.spinData.attempts += 1;
    user.spinData.history.push(result);
    if (result === '₦50,000') {
      user.spinData.won = true;
    }
    user.lastActivity = new Date();
    
    await user.save();
    res.json({ success: true, spinData: user.spinData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track share
router.post('/share', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const user = await User.findOne({ sessionId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.shareProgress.count += 1;
    if (user.shareProgress.count >= 10) {
      user.shareProgress.done = true;
      user.completed = true;
      user.currentStep = 'completed';
    }
    user.lastActivity = new Date();
    
    await user.save();
    res.json({ success: true, shareProgress: user.shareProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;