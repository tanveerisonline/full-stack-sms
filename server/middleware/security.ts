import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiting configurations
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Much higher limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: process.env.NODE_ENV === 'development' ? 60 : 15 * 60 // Shorter retry for development
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting entirely for development if needed
  skip: (req, res) => process.env.NODE_ENV === 'development',
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // Much higher limit for development
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: process.env.NODE_ENV === 'development' ? 60 : 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  // More lenient for development
  skip: (req, res) => process.env.NODE_ENV === 'development',
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 upload requests per minute
  message: {
    error: 'Too many upload requests, please try again later.',
    retryAfter: 60
  },
});

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove potentially revealing headers
  res.removeHeader('X-Powered-By');
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic input sanitization for common XSS patterns
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/[<>]/g, '') // Remove < and > characters
        .trim()
        .slice(0, 1000); // Limit string length
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    // Log requests (you might want to use a proper logging library)
    if (req.url.startsWith('/api/')) {
      console.log(`API Request: ${JSON.stringify(logData)}`);
    }
  });
  
  next();
};

// CORS configuration
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, you should specify allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  } else {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

export default {
  generalRateLimit,
  authRateLimit,
  uploadRateLimit,
  securityHeaders,
  sanitizeInput,
  requestLogger,
  corsOptions,
  errorHandler
};