const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

// 1. Create a connection to your Redis database.
const redisClient = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Redis({ host: 'localhost', port: 6379 });

// ================================================================
// GUARD 1: The IP-Based Limiter (For Login Routes)
// ================================================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 50, // Generous limit: 50 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  
  // 2. Save the IP addresses directly into Redis.
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// ================================================================
// GUARD 2: The User ID-Based Limiter (For the rest of the app)
// ================================================================
const userApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // Allow 100 API requests per minute per user
  message: {
    error: 'You are making requests too quickly. Please slow down.'
  },
  
  // 3. Save data into Redis.
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),

  // 4. Look at the logged-in User's ID instead of the IP.
  keyGenerator: (req) => {
    // We assume req.user is populated by your auth middleware
    if (req.user) return req.user.id;
    // Fallback if user is not logged in, using a safe format to avoid IPv6 warnings
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  }
});

module.exports = {
  authLimiter,
  userApiLimiter
};
