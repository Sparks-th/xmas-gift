const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Visit = require('../models/Visit');

// Get analytics dashboard
router.get('/stats', async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();
    const totalUsers = await User.countDocuments();
    const completedUsers = await User.countDocuments({ completed: true });
    const activeUsers = await User.countDocuments({
      lastActivity: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Active in last 30 min
    });
    
    const stepDistribution = await User.aggregate([
      { $group: { _id: '$currentStep', count: { $sum: 1 } } }
    ]);
    
    const deviceStats = await Visit.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalVisits,
      totalUsers,
      completedUsers,
      activeUsers,
      conversionRate: totalUsers > 0 ? ((completedUsers / totalUsers) * 100).toFixed(2) : 0,
      stepDistribution,
      deviceStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get('/recent', async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ lastActivity: -1 })
      .limit(20)
      .select('ipAddress currentStep lastActivity spinData shareProgress');
    
    res.json(recentUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;