import * as promClient from 'prom-client';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  registers: [register]
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of active users',
  registers: [register]
});

export {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeUsers
};