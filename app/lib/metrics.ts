// Edge Runtime compatible metrics implementation
// This avoids using prom-client which has Node.js dependencies

// Simple in-memory metrics store
const metrics = {
  httpRequestsTotal: new Map<string, number>(),
  httpRequestDuration: new Map<string, number[]>(),
  activeUsers: 0
};

// Helper function to create metric keys
function createKey(labels: Record<string, string>): string {
  return Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join(',');
}

// Custom metrics implementation
export const httpRequestsTotal = {
  inc: (labels: Record<string, string>) => {
    const key = createKey(labels);
    const current = metrics.httpRequestsTotal.get(key) || 0;
    metrics.httpRequestsTotal.set(key, current + 1);
  }
};

export const httpRequestDuration = {
  observe: (labels: Record<string, string>, value: number) => {
    const key = createKey(labels);
    const current = metrics.httpRequestDuration.get(key) || [];
    current.push(value);
    metrics.httpRequestDuration.set(key, current);
  }
};

export const activeUsers = {
  set: (value: number) => {
    metrics.activeUsers = value;
  },
  inc: (value: number = 1) => {
    metrics.activeUsers += value;
  },
  dec: (value: number = 1) => {
    metrics.activeUsers = Math.max(0, metrics.activeUsers - value);
  }
};

// Export metrics data for Prometheus scraping
export function getMetricsData() {
  const lines: string[] = [];
  
  // HTTP requests total
  for (const [key, value] of metrics.httpRequestsTotal) {
    const labels = key ? `{${key}}` : '';
    lines.push(`# HELP http_requests_total Total number of HTTP requests`);
    lines.push(`# TYPE http_requests_total counter`);
    lines.push(`http_requests_total${labels} ${value}`);
  }
  
  // HTTP request duration
  for (const [key, values] of metrics.httpRequestDuration) {
    if (values.length === 0) continue;
    
    const labels = key ? `{${key}}` : '';
    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;
    
    // Calculate percentiles
    const sorted = [...values].sort((a, b) => a - b);
    
    lines.push(`# HELP http_request_duration_seconds Duration of HTTP requests in seconds`);
    lines.push(`# TYPE http_request_duration_seconds histogram`);
    lines.push(`http_request_duration_seconds_sum${labels} ${sum}`);
    lines.push(`http_request_duration_seconds_count${labels} ${count}`);
    lines.push(`http_request_duration_seconds_bucket{le="0.1"}${labels} ${sorted.filter(v => v <= 0.1).length}`);
    lines.push(`http_request_duration_seconds_bucket{le="0.5"}${labels} ${sorted.filter(v => v <= 0.5).length}`);
    lines.push(`http_request_duration_seconds_bucket{le="1.0"}${labels} ${sorted.filter(v => v <= 1.0).length}`);
    lines.push(`http_request_duration_seconds_bucket{le="2.5"}${labels} ${sorted.filter(v => v <= 2.5).length}`);
    lines.push(`http_request_duration_seconds_bucket{le="5.0"}${labels} ${sorted.filter(v => v <= 5.0).length}`);
    lines.push(`http_request_duration_seconds_bucket{le="10.0"}${labels} ${sorted.filter(v => v <= 10.0).length}`);
    lines.push(`http_request_duration_seconds_bucket{le="+Inf"}${labels} ${count}`);
  }
  
  // Active users
  lines.push(`# HELP active_users_total Number of active users`);
  lines.push(`# TYPE active_users_total gauge`);
  lines.push(`active_users_total ${metrics.activeUsers}`);
  
  return lines.join('\n');
}

// Mock register for compatibility
export const register = {
  metrics: () => getMetricsData()
};