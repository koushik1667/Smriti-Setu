const app = require('./app');
const { connectDB } = require('./config/db');
const { startKeepAlive } = require('./services/keepAliveService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  PharmaVision AI Server running on port ${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);

    // Start background keep-alive check to keep Render free tier awake 24/7
    startKeepAlive();
  });
}

startServer();

