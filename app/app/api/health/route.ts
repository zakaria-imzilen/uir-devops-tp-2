import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Basic health check response
    const healthData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "flowcraft-studio",
      version: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
    }

    return NextResponse.json(healthData)
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: "Health check failed"
      },
      { status: 500 }
    )
  }
}