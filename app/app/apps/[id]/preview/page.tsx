import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PreviewPageProps {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/login")
  }

  // Fetch the app
  const { data: app, error: appError } = await supabase.from("apps").select("*").eq("id", id).single()

  if (appError || !app) {
    notFound()
  }

  // Ensure the user owns this app (RLS should handle this, but double-check)
  if (app.user_id !== userData.user.id) {
    notFound()
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top toolbar */}
      <div className="border-b bg-background p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Preview: {app.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href={`/apps/${app.id}`}>Edit</Link>
          </Button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1">
        <iframe
          src={`/apps/${app.id}/preview/render`}
          className="w-full h-full border-0"
          title={`Preview of ${app.name}`}
        />
      </div>
    </div>
  )
}
