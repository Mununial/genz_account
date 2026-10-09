/**
 * Rate Limiting Middleware
 * Gen-Z University Accounts System
 */

const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// Strict limiter for login and password changes to block brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 2000 : 25, // Generous in dev/test, safe in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// General limiter for public API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 20000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please slow down.'
  }
});

module.exports = {
  authLimiter,
  apiLimiter
};

