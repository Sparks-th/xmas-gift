const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    unique: true,
    sparse: true
  },
  currentStep: {
    type: String,
    enum: ['loading', 'eligible', 'step1', 'step2', 'gender', 'age', 'registration', 'spin', 'share', 'completed'],
    default: 'loading'
  },
  phoneNumber: String,
  email: String,
  hasPalmpayAccount: Boolean,
  appliedLastYear: Boolean,
  gender: String,
  ageRange: String,
  spinData: {
    attempts: { type: Number, default: 0 },
    history: [String],
    won: { type: Boolean, default: false }
  },
  shareProgress: {
    count: { type: Number, default: 0 },
    done: { type: Boolean, default: false }
  },
  userAgent: String,
  referrer: String,
  visitedAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ ipAddress: 1, visitedAt: -1 });
userSchema.index({ sessionId: 1 });

module.exports = mongoose.model('User', userSchema);