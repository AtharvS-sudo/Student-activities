/**
 * Token Bucket Algorithm Implementation for API Rate Limiting
 * 
 * Networking Concepts:
 * - Traffic Shaping: Controls the rate of data transmission
 * - Burst Handling: Allows temporary bursts while maintaining average rate
 * - Fair Resource Allocation: Prevents API abuse and ensures fair usage
 * 
 * Algorithm:
 * 1. Each user gets a bucket with a maximum capacity of tokens
 * 2. Tokens are added at a constant rate (refill rate)
 * 3. Each request consumes one token
 * 4. If no tokens available, request is rejected (429 Too Many Requests)
 * 5. Allows bursts up to bucket capacity
 */

class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity; // Maximum tokens in bucket
    this.tokens = capacity; // Current tokens available
    this.refillRate = refillRate; // Tokens added per second
    this.lastRefill = Date.now(); // Last time tokens were refilled
  }

  // Refill tokens based on time elapsed
  refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  // Try to consume a token
  consume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  // Get current token count
  getTokens() {
    this.refill();
    return Math.floor(this.tokens);
  }

  // Get time until next token is available (in seconds)
  getTimeUntilNextToken() {
    if (this.tokens >= 1) return 0;
    return (1 - this.tokens) / this.refillRate;
  }
}

// Store buckets per IP address or user ID
const buckets = new Map();

// Configuration for different rate limits
const rateLimitConfigs = {
  // General API endpoints
  default: {
    capacity: 100, // 100 requests
    refillRate: 10, // 10 requests per second
    windowMs: 60000, // 1 minute window for display
  },
  
  // Authentication endpoints (stricter)
  auth: {
    capacity: 10, // 10 attempts
    refillRate: 1, // 1 request per second
    windowMs: 60000, // 1 minute window
  },
  
  // Chat/messaging (moderate)
  chat: {
    capacity: 50, // 50 messages
    refillRate: 5, // 5 messages per second
    windowMs: 60000, // 1 minute window
  },
  
  // File uploads (very strict)
  upload: {
    capacity: 5, // 5 uploads
    refillRate: 0.1, // 1 upload per 10 seconds
    windowMs: 60000, // 1 minute window
  },
};

// Get or create bucket for identifier
function getBucket(identifier, config) {
  if (!buckets.has(identifier)) {
    buckets.set(identifier, new TokenBucket(config.capacity, config.refillRate));
  }
  return buckets.get(identifier);
}

// Clean up old buckets periodically (memory management)
setInterval(() => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes

  for (const [identifier, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      buckets.delete(identifier);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Rate limiter middleware factory
function createRateLimiter(configName = 'default') {
  const config = rateLimitConfigs[configName] || rateLimitConfigs.default;

  return (req, res, next) => {
    // Get identifier (prefer user ID, fallback to IP)
    const identifier = req.user?.id || req.ip || req.connection.remoteAddress;

    // Get or create bucket for this identifier
    const bucket = getBucket(identifier, config);

    // Try to consume a token
    if (bucket.consume()) {
      // Request allowed
      const remainingTokens = bucket.getTokens();
      
      // Add rate limit headers (standard practice)
      res.setHeader('X-RateLimit-Limit', config.capacity);
      res.setHeader('X-RateLimit-Remaining', remainingTokens);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());

      console.log(`✅ Rate limit OK: ${identifier} - ${remainingTokens} tokens remaining`);
      next();
    } else {
      // Rate limit exceeded
      const retryAfter = Math.ceil(bucket.getTimeUntilNextToken());
      
      res.setHeader('X-RateLimit-Limit', config.capacity);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());
      res.setHeader('Retry-After', retryAfter);

      console.log(`❌ Rate limit exceeded: ${identifier} - retry after ${retryAfter}s`);

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: retryAfter,
        limit: config.capacity,
      });
    }
  };
}

// Export middleware for different use cases
module.exports = {
  // General rate limiter
  rateLimiter: createRateLimiter('default'),
  
  // Specific rate limiters
  authRateLimiter: createRateLimiter('auth'),
  chatRateLimiter: createRateLimiter('chat'),
  uploadRateLimiter: createRateLimiter('upload'),
  
  // Custom rate limiter
  createRateLimiter,
  
  // For monitoring/admin purposes
  getBucketStats: (identifier) => {
    const bucket = buckets.get(identifier);
    if (!bucket) return null;
    
    return {
      tokens: bucket.getTokens(),
      capacity: bucket.capacity,
      refillRate: bucket.refillRate,
      timeUntilNextToken: bucket.getTimeUntilNextToken(),
    };
  },
  
  // Get all active buckets (for admin dashboard)
  getAllBuckets: () => {
    const stats = [];
    for (const [identifier, bucket] of buckets.entries()) {
      stats.push({
        identifier,
        tokens: bucket.getTokens(),
        capacity: bucket.capacity,
        refillRate: bucket.refillRate,
      });
    }
    return stats;
  },
};
