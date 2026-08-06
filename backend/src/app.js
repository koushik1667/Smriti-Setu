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
const errorHandler = require('./middleware/errorHandler');

let app;

if (express) {
  const cors = require('cors');
  app = express();

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'PharmaVision AI Backend',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api', visionRoutes);
  app.use('/api', historyRoutes);
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
    { method: 'POST', path: '/api/analyze-medicine', middleware: require('./middleware/auth').verifyToken, handler: require('./controllers/visionController').analyzeMedicine },
    { method: 'POST', path: '/api/vision/chat', middleware: require('./middleware/auth').verifyToken, handler: require('./controllers/visionController').chatWithMedicineAI },
    { method: 'POST', path: '/api/chat', middleware: require('./middleware/auth').verifyToken, handler: require('./controllers/visionController').chatWithMedicineAI },
    { method: 'GET', path: '/api/history', middleware: require('./middleware/auth').verifyToken, handler: require('./controllers/historyController').getHistory }
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

    if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'healthy', service: 'PharmaVision AI Backend (Native)' }));
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = {};
      }

      // Response helper
      res.json = (data) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      };

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };

      const matchedRoute = routes.find(r => r.method === req.method && r.path === parsedUrl.pathname);

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
