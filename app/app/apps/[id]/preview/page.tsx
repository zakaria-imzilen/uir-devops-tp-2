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
      <div className="relative border-b border-white/20 bg-white/10 backdrop-blur-xl shadow-lg shadow-purple-500/5 p-4 flex items-center justify-between">
  {/* Gradient background, confined to toolbar */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900" />

  <div className="flex items-center gap-4">
    <h1 className="text-xl font-semibold text-white/90">Preview: {app.name}</h1>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline" asChild className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all">
      <Link href="/dashboard">Dashboard</Link>
    </Button>
    <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-md transition-all duration-200 hover:scale-[1.02]">
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
