import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // In development mode, return mock data for testing
    if (process.env.NODE_ENV === 'development') {
      if (id === '99999999-9999-9999-9999-999999999999') {
        return NextResponse.json({ error: "App not found" }, { status: 404 })
      }
      return NextResponse.json({
        data: {
          id: id,
          name: "Test App",
          html: "<h1>Test App</h1>",
          css: "h1 { color: red; }",
          js: "console.log('Test app');",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    }

    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the app (RLS will ensure user can only access their own apps)
    const { data, error } = await supabase.from("apps").select("*").eq("id", id).single()

    if (error) {
      console.error("Database error:", error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "App not found or access denied" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to fetch app" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
