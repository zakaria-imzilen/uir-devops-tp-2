import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, html, css, js } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "App name is required" }, { status: 400 })
    }

    // In development mode, return mock created app for testing
    if (process.env.NODE_ENV === 'development') {
      const mockApp = {
        id: `test-${Date.now()}`,
        name: name.trim(),
        html: html || "",
        css: css || "",
        js: js || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json({ data: mockApp }, { status: 201 })
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

    // Create the app
    const { data, error } = await supabase
      .from("apps")
      .insert({
        user_id: user.id,
        name: name.trim(),
        html: html || "",
        css: css || "",
        js: js || "",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      // Handle missing table/schema cache error more clearly
      if ((error as any)?.code === "PGRST205") {
        return NextResponse.json(
          {
            error:
              "Apps table is missing. Initialize your database (see app/db/schema.apps.sql)",
            code: "PGRST205",
          },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: "Failed to create app" }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
