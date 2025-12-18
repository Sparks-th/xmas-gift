const requestIp = require('request-ip');

const ipCapture = (req, res, next) => {
  req.clientIp = requestIp.getClientIp(req);
  next();
};

const getDeviceType = (userAgent) => {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  } else if (/mozilla|chrome|safari|firefox|opera/i.test(ua)) {
    return 'desktop';
  }
  return 'unknown';
};

const getBrowser = (userAgent) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';
  return 'Unknown';
};

module.exports = { ipCapture, getDeviceType, getBrowser };