import rateLimit from 'express-rate-limit';

// Rate limiter for general endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Stricter rate limiter for scanning endpoints
export const scanLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 scan requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Scan quota exceeded. Please slow down and try again in 10 minutes',
  },
});

// Stricter rate limiter for authentication routes (register/login)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 authentication attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login or signup attempts. Please try again after an hour',
  },
});
