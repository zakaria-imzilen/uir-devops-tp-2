import { getMetricsData } from '../../../../lib/metrics';

export async function GET() {
  const metrics = getMetricsData();
  return new Response(metrics, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
    },
  });
}