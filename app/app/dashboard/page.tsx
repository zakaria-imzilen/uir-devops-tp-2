import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/login")
  }

  // Fetch user's apps
  const { data: apps, error: appsError } = await supabase
    .from("apps")
    .select("*")
    .order("created_at", { ascending: false })

  if (appsError) {
    console.error("Error fetching apps:", appsError)
  }

  const user = {
    id: data.user.id,
    email: data.user.email!,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground mt-1">Manage your applications and create new ones</p>
          </div>
          <Button asChild size="lg">
            <Link href="/apps/new">Create New App</Link>
          </Button>
        </div>

        <DashboardClient initialApps={apps || []} />
      </main>
    </div>
  )
}
