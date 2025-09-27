import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In development mode, return mock data for testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        data: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Sample App",
            html: "<h1>Hello World</h1>",
            css: "h1 { color: blue; }",
            js: "console.log('Hello from sample app');",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
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

    // Fetch user's apps (RLS will automatically filter by user)
    const { data, error } = await supabase.from("apps").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
