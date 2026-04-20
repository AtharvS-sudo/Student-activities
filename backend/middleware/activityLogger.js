const ActivityLog = require('../models/ActivityLog');

// Helper function to get client IP address
const getClientIp = (req) => {
  // Safety check for headers
  if (!req.headers) {
    return req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           'unknown';
  }

  // Check for X-Forwarded-For header (proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Check for X-Real-IP header
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Fallback to connection remote address
  return req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.connection?.socket?.remoteAddress ||
         'unknown';
};

// Middleware to log activities
const logActivity = async (req, action, details = {}) => {
  try {
    const logData = {
      action,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      method: req.method,
      endpoint: req.originalUrl || req.url,
      timestamp: new Date(),
    };

    // Add user if available
    if (req.user?.id || req.user?._id) {
      logData.user = req.user.id || req.user._id;
    }

    // Add optional fields
    if (details.resourceType) logData.resourceType = details.resourceType;
    if (details.resourceId) logData.resourceId = details.resourceId;
    if (details.details) logData.details = details.details;
    if (details.statusCode) logData.statusCode = details.statusCode;

    console.log('📝 Attempting to log activity:', { action, user: logData.user, ip: logData.ipAddress });
    
    const savedLog = await ActivityLog.create(logData);
    console.log(`✅ Activity logged successfully: ${action} by user ${req.user?.email || 'unknown'} from IP ${logData.ipAddress}`, savedLog._id);
  } catch (error) {
    console.error('❌ Failed to log activity:', error.message);
    console.error('Error details:', error);
    // Don't throw error - logging failure shouldn't break the request
  }
};

// Middleware to automatically log all requests
const autoLogActivity = async (req, res, next) => {
  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    // Log after response is sent
    if (req.user && req.method !== 'GET') {
      const action = determineAction(req);
      if (action) {
        logActivity(req, action, {
          statusCode: res.statusCode,
          details: JSON.stringify(data).substring(0, 200),
        }).catch(err => console.error('Auto-log error:', err));
      }
    }
    return originalJson(data);
  };
  
  next();
};

// Determine action based on route and method
const determineAction = (req) => {
  const path = req.path;
  const method = req.method;
  
  // Skip GET requests for auto-logging
  if (method === 'GET') return null;
  
  if (path.includes('/notices')) {
    if (method === 'POST') return 'create_notice';
    if (method === 'PUT') return 'edit_notice';
    if (method === 'DELETE') return 'delete_notice';
  }
  
  if (path.includes('/club-applications')) {
    if (method === 'POST') return 'apply_club';
    if (method === 'PATCH') return 'approve_application';
  }
  
  return null;
};

module.exports = {
  logActivity,
  autoLogActivity,
  getClientIp,
};
