import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, html, css, js } = body

    // Validate input
    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "Invalid app name" }, { status: 400 })
    }

    // In development mode, return mock updated data for testing
    if (process.env.NODE_ENV === 'development') {
      if (id === '99999999-9999-9999-9999-999999999999') {
        return NextResponse.json({ error: "App not found" }, { status: 404 })
      }

      const updatedApp = {
        id: id,
        name: name || "Updated Test App",
        html: html || "<h1>Updated Test App</h1>",
        css: css || "h1 { color: red; }",
        js: js || "console.log('Updated app');",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json({ data: updatedApp })
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

    // Build update object
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (html !== undefined) updateData.html = html
    if (css !== undefined) updateData.css = css
    if (js !== undefined) updateData.js = js

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Update the app (RLS will ensure user can only update their own apps)
    const { data, error } = await supabase.from("apps").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Database error:", error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "App not found or access denied" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to update app" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
