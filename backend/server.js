const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const helmet = require('helmet');



const { ipCapture, getDeviceType, getBrowser } = require('./middleware/ipCapture');
const progressRoutes = require('./routes/progress');
const analyticsRoutes = require('./routes/analytics');
const Visit = require('./models/Visit');

const app = express();
// Add after express initialization
app.use(helmet());

// Middleware
// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Whitelist of allowed origins
    const allowedOrigins = [
      // 'http://localhost:3000',
      // 'http://20.164.17.30:3333',
      // 'https://yourdomain.com',
      'https://xmas-gift.nett.to'
      // Add your actual frontend domain here
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(ipCapture);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Track visit
app.post('/api/visit', async (req, res) => {
  try {
    const visit = new Visit({
      ipAddress: req.clientIp,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer || req.headers.referrer,
      device: getDeviceType(req.headers['user-agent']),
      browser: getBrowser(req.headers['user-agent'])
    });
    await visit.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api', progressRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
