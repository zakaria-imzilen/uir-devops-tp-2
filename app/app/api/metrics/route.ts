import { getMetricsData } from '../../../lib/metrics';

export async function GET() {
  try {
    const metrics = getMetricsData();
    return new Response(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return new Response('# Metrics temporarily unavailable\n', {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  }
}