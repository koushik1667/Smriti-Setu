try {
  require('dotenv').config();
} catch (e) {}

let express;
try {
  express = require('express');
} catch (e) {
  express = null;
}

const authRoutes = require('./routes/authRoutes');
const visionRoutes = require('./routes/visionRoutes');
const historyRoutes = require('./routes/historyRoutes');
const cognitiveRoutes = require('./routes/cognitiveRoutes');
const documentRoutes = require('./routes/documentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middleware/errorHandler');

let app;

if (express) {
  const cors = require('cors');
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');

  app = express();

  // Production Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for API JSON endpoints
    crossOriginEmbedderPolicy: false
  }));

  // Dynamic Production CORS Configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  if (process.env.CLIENT_URL) {
    allowedOrigins.push(...process.env.CLIENT_URL.split(',').map(u => u.trim()));
  }

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-api-key', 'x-openai-api-key'],
    credentials: true
  }));

  // Body parser with 50mb limit for high-res medicine and report uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const { getKeepAliveStatus } = require('./services/keepAliveService');

  // Health check endpoints (placed before rate-limiting to prevent false blocks)
  const handleHealthCheck = (req, res) => {
    const keepAlive = getKeepAliveStatus();
    res.json({
      status: 'healthy',
      service: 'PharmaVision AI Backend (Production Secured)',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      env: process.env.NODE_ENV || 'development',
      keepAlive: {
        enabled: keepAlive.enabled,
        targetUrl: keepAlive.targetUrl,
        intervalMinutes: Math.round(keepAlive.intervalMs / 60000),
        totalPings: keepAlive.totalPings,
        successfulPings: keepAlive.successfulPings,
        failedPings: keepAlive.failedPings,
        lastPingTime: keepAlive.lastPingTime,
        lastStatus: keepAlive.lastStatus,
        lastLatencyMs: keepAlive.lastLatencyMs,
        nextPingTime: keepAlive.nextPingTime
      }
    });
  };

  app.get('/health', handleHealthCheck);
  app.get('/api/health', handleHealthCheck);

  // Global API Rate Limiter: 150 requests per 15 mins
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again after a few minutes.'
    }
  });

  // Strict AI Vision & Consultation Rate Limiter: 45 AI scans per 15 mins
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 45,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'AI scanning limit reached for this session. Please wait a few minutes before scanning again.'
    }
  });

  app.use('/api', globalLimiter);
  app.use('/api/analyze-medicine', aiLimiter);
  app.use('/api/analyze-report', aiLimiter);
  app.use('/api/analyze-prescription', aiLimiter);
  app.use('/api/analyze-dual-audit', aiLimiter);
  app.use('/api/vision/chat', aiLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api', visionRoutes);
  app.use('/api', historyRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/chats', chatRoutes);
  app.use('/api/cognitive', cognitiveRoutes);
  app.use(errorHandler);
} else {
  // Built-in Lightweight HTTP Server Fallback (Zero External Dependencies Required)
  const http = require('http');
  const url = require('url');

  const routes = [
    { method: 'POST', path: '/api/auth/register', handler: require('./controllers/authController').register },
    { method: 'POST', path: '/api/auth/login', handler: require('./controllers/authController').login },
    { method: 'POST', path: '/api/auth/google', handler: require('./controllers/authController').googleLogin },
    { method: 'GET', path: '/api/auth/profile', middleware: require('./middleware/auth').verifyToken, handler: require('./controllers/authController').getProfile },
    { method: 'POST', path: '/api/analyze-medicine', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/visionController').analyzeMedicine },
    { method: 'POST', path: '/api/analyze-report', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/reportController').analyzeReport },
    { method: 'POST', path: '/api/analyze-prescription', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/prescriptionController').analyzePrescription },
    { method: 'POST', path: '/api/analyze-dual-audit', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/dualAuditController').analyzeDualAudit },
    { method: 'POST', path: '/api/history/batch', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/prescriptionController').batchSaveMedicines },
    { method: 'POST', path: '/api/vision/chat', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/visionController').chatWithMedicineAI },
    { method: 'POST', path: '/api/chat', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/visionController').chatWithMedicineAI },

    { method: 'GET', path: '/api/history', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/historyController').getHistory },
    { method: 'DELETE', path: '/api/history/:id', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/historyController').deleteHistoryItem },
    { method: 'GET', path: '/api/documents', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/documentController').getDocuments },
    { method: 'GET', path: '/api/documents/:id', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/documentController').getDocumentById },
    { method: 'POST', path: '/api/documents', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/documentController').createDocument },
    { method: 'DELETE', path: '/api/documents/:id', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/documentController').deleteDocument },
    { method: 'GET', path: '/api/chats', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/chatController').getChatHistory },
    { method: 'GET', path: '/api/chats/sessions', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/chatController').getRecentSessions },
    { method: 'POST', path: '/api/chats', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/chatController').saveChatMessage },
    { method: 'DELETE', path: '/api/chats/:sessionId', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/chatController').clearChatHistory },
    { method: 'POST', path: '/api/cognitive/sync', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/cognitiveController').batchSync },
    { method: 'GET', path: '/api/cognitive/caregiver-analytics', middleware: require('./middleware/auth').optionalAuth, handler: require('./controllers/cognitiveController').getCaregiverAnalytics },
    { method: 'POST', path: '/api/translate', handler: require('./controllers/translationController').translateText },
    { method: 'POST', path: '/api/voice-agent/chat', handler: require('./controllers/voiceAgentController').handleVoiceChat },
    { method: 'GET', path: '/api/tts', handler: require('./controllers/ttsController').streamAudio },
    { method: 'POST', path: '/api/therapy/chat', handler: require('./controllers/therapyController').handleTherapySession },
    { method: 'GET', path: '/api/therapy/greeting', handler: require('./controllers/therapyController').getInitialGreeting }
  ];

  app = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET' && (parsedUrl.pathname === '/api/health' || parsedUrl.pathname === '/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const { getKeepAliveStatus } = require('./services/keepAliveService');
      const keepAlive = getKeepAliveStatus();
      return res.end(JSON.stringify({
        status: 'healthy',
        service: 'PharmaVision AI Backend (Native)',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        keepAlive
      }));
    }


    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = {};
      }

      req.params = {};
      req.query = parsedUrl.query || {};

      // Response helper
      res.json = (data) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      };

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };

      res.send = (data) => {
        if (!res.headersSent) {
          if (Buffer.isBuffer(data)) {
            if (!res.getHeader('Content-Type')) {
              res.setHeader('Content-Type', 'audio/mpeg');
            }
          } else if (typeof data === 'string') {
            if (!res.getHeader('Content-Type')) {
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            }
          }
        }
        res.end(data);
      };

      let matchedRoute = null;
      for (const r of routes) {
        if (r.method !== req.method) continue;
        if (r.path.includes(':')) {
          const routeParts = r.path.split('/');
          const urlParts = parsedUrl.pathname.split('/');
          if (routeParts.length === urlParts.length) {
            let match = true;
            const params = {};
            for (let i = 0; i < routeParts.length; i++) {
              if (routeParts[i].startsWith(':')) {
                params[routeParts[i].substring(1)] = urlParts[i];
              } else if (routeParts[i] !== urlParts[i]) {
                match = false;
                break;
              }
            }
            if (match) {
              req.params = params;
              matchedRoute = r;
              break;
            }
          }
        } else if (r.path === parsedUrl.pathname) {
          matchedRoute = r;
          break;
        }
      }

      if (!matchedRoute) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Endpoint not found' }));
      }

      const next = (err) => {
        if (err) return errorHandler(err, req, res, () => {});
        matchedRoute.handler(req, res, (e) => { if (e) errorHandler(e, req, res, () => {}); });
      };

      if (matchedRoute.middleware) {
        matchedRoute.middleware(req, res, next);
      } else {
        next();
      }
    });
  };
}

module.exports = app;
