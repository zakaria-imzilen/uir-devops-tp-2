import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GrapesJSEditor } from "@/components/grapesjs-editor"

export default async function NewAppPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/login")
  }

  return <GrapesJSEditor isNew={true} />
}
