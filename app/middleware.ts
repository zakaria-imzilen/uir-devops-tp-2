import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";
import { httpRequestsTotal, httpRequestDuration } from './lib/metrics';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname } = request.nextUrl;
  
  // Your existing Supabase session handling
  const response = await updateSession(request);
  
  // Add metrics tracking
  const duration = (Date.now() - start) / 1000;
  const statusCode = response.status || 200;
  
  // Only track non-metrics endpoints to avoid recursion
  if (!pathname.startsWith('/api/metrics')) {
    httpRequestsTotal.inc({
      method: request.method,
      route: pathname,
      status_code: statusCode.toString()
    });
    
    httpRequestDuration.observe({
      method: request.method,
      route: pathname
    }, duration);
  }
  
  return response;
}

export const config = {
  matcher: [
    // Your existing matcher, just add metrics exclusion
    "/((?!_next/static|_next/image|favicon.ico|api/metrics|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};