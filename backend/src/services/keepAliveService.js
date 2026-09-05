/**
 * Render Keep-Alive Service
 * 
 * Prevents Render Free Tier web services from spinning down / sleeping after 15 minutes
 * of inactivity by regularly sending lightweight inbound HTTP checks to the public endpoint.
 * 
 * Render provides RENDER_EXTERNAL_URL automatically in production.
 * If this request hits the public domain over HTTPS, Render's ingress router registers
 * it as active incoming web traffic, resetting the 15-minute countdown.
 */

const https = require('https');
const http = require('http');

let keepAliveTimer = null;
let retryTimer = null;

const state = {
  enabled: false,
  targetUrl: null,
  intervalMs: 10 * 60 * 1000, // Default: 10 minutes (Render sleeps at 15 mins)
  totalPings: 0,
  successfulPings: 0,
  failedPings: 0,
  lastPingTime: null,
  lastStatus: null,
  lastLatencyMs: null,
  lastError: null,
  nextPingTime: null,
  startedAt: null
};

/**
 * Resolves the public server URL to ping.
 */
function resolveTargetUrl() {
  const customUrl = process.env.KEEP_ALIVE_URL;
  if (customUrl && customUrl.trim()) return customUrl.trim();

  const renderExternal = process.env.RENDER_EXTERNAL_URL;
  if (renderExternal && renderExternal.trim()) {
    const base = renderExternal.trim().replace(/\/+$/, '');
    return `${base}/api/health`;
  }

  const backendUrl = process.env.BACKEND_URL || process.env.SERVER_URL;
  if (backendUrl && backendUrl.trim()) {
    const base = backendUrl.trim().replace(/\/+$/, '');
    return base.endsWith('/api/health') ? base : `${base}/api/health`;
  }

  // Fallback if running on Render
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    return 'https://pharmavision-backend.onrender.com/api/health';
  }

  return null;
}

/**
 * Performs a single HTTP/HTTPS GET request to the target URL
 */
function ping(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'PharmaVision-Render-KeepAlive/1.0',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 25000 // 25s timeout
      },
      (res) => {
        const latencyMs = Date.now() - startTime;
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            latencyMs,
            body: data
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Keep-alive ping request timed out after 25s'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Execute keep-alive ping and schedule next run
 */
async function executePing() {
  if (!state.enabled || !state.targetUrl) return;

  const timestamp = new Date().toISOString();
  state.totalPings++;

  try {
    const result = await ping(state.targetUrl);
    state.successfulPings++;
    state.lastPingTime = timestamp;
    state.lastStatus = result.statusCode;
    state.lastLatencyMs = result.latencyMs;
    state.lastError = null;

    console.log(`[Render Keep-Alive] [${timestamp}] Ping OK -> ${state.targetUrl} (Status: ${result.statusCode}, Latency: ${result.latencyMs}ms, Total: #${state.totalPings})`);

    // Schedule next regular ping
    scheduleNext(state.intervalMs);
  } catch (err) {
    state.failedPings++;
    state.lastPingTime = timestamp;
    state.lastError = err.message;

    console.warn(`[Render Keep-Alive] [${timestamp}] Ping failed -> ${state.targetUrl}: ${err.message}. Retrying in 1 minute.`);

    // On failure, retry in 1 minute instead of waiting the full interval
    scheduleNext(60 * 1000);
  }
}

function scheduleNext(delayMs) {
  if (keepAliveTimer) clearTimeout(keepAliveTimer);
  state.nextPingTime = new Date(Date.now() + delayMs).toISOString();

  keepAliveTimer = setTimeout(() => {
    executePing();
  }, delayMs);

  // Allow Node process to exit gracefully if keepAlive is the only active handle
  if (keepAliveTimer && typeof keepAliveTimer.unref === 'function') {
    keepAliveTimer.unref();
  }
}

/**
 * Start the Keep-Alive background worker
 */
function startKeepAlive(options = {}) {
  // Check if disabled explicitly via env
  if (process.env.KEEP_ALIVE === 'false' || process.env.ENABLE_KEEP_ALIVE === 'false') {
    console.log('[Render Keep-Alive] Disabled via environment variable.');
    return;
  }

  const targetUrl = options.targetUrl || resolveTargetUrl();
  if (!targetUrl) {
    console.log('[Render Keep-Alive] No external URL detected (local dev mode). Keep-alive inactive.');
    return;
  }

  // Parse interval in minutes (default: 10 minutes)
  const envMinutes = parseFloat(process.env.KEEP_ALIVE_INTERVAL_MINUTES);
  const minutes = !isNaN(envMinutes) && envMinutes > 0 ? envMinutes : 10;
  const intervalMs = Math.max(1, minutes) * 60 * 1000;

  state.enabled = true;
  state.targetUrl = targetUrl;
  state.intervalMs = intervalMs;
  state.startedAt = new Date().toISOString();

  console.log(`[Render Keep-Alive] Initialized. Target: ${targetUrl} (Interval: ${minutes}m / Render sleep threshold: 15m)`);

  // First ping after 45 seconds to let server finish booting and DNS propagate
  const initialDelay = process.env.NODE_ENV === 'production' ? 45 * 1000 : 10 * 1000;
  scheduleNext(initialDelay);
}

/**
 * Stop Keep-Alive
 */
function stopKeepAlive() {
  if (keepAliveTimer) clearTimeout(keepAliveTimer);
  if (retryTimer) clearTimeout(retryTimer);
  state.enabled = false;
  state.nextPingTime = null;
  console.log('[Render Keep-Alive] Stopped.');
}

/**
 * Get current keep-alive telemetry
 */
function getKeepAliveStatus() {
  return {
    ...state,
    uptimeSeconds: state.startedAt ? Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000) : 0
  };
}

module.exports = {
  startKeepAlive,
  stopKeepAlive,
  getKeepAliveStatus,
  resolveTargetUrl,
  ping
};
