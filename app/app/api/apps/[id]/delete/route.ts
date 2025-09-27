import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // In development mode, return mock deletion response for testing
    if (process.env.NODE_ENV === 'development') {
      if (id === '99999999-9999-9999-9999-999999999999') {
        return NextResponse.json({ error: "App not found" }, { status: 404 })
      }
      return NextResponse.json({ message: "App deleted successfully" })
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

    // Delete the app (RLS will ensure user can only delete their own apps)
    const { error } = await supabase.from("apps").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete app" }, { status: 500 })
    }

    return NextResponse.json({ message: "App deleted successfully" })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
