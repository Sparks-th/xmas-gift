const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true
  },
  country: String,
  city: String,
  userAgent: String,
  referrer: String,
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown']
  },
  browser: String,
  visitedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

visitSchema.index({ ipAddress: 1, visitedAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);