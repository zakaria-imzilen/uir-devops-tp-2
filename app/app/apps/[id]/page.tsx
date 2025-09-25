import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GrapesJSEditor } from "@/components/grapesjs-editor"

interface EditAppPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAppPage({ params }: EditAppPageProps) {
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

  return <GrapesJSEditor app={app} />
}
