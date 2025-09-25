import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardClient } from "./dashboard-client"
import { Plus, Sparkles } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-white/20 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-purple-400/40 rounded-full animate-bounce delay-700"></div>
      <div className="absolute top-1/3 left-10 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-pink-400/40 rounded-full animate-bounce delay-1500"></div>

      <div className="relative z-10">
        <Navbar user={user} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section with Glassmorphism */}
          <div className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-purple-500/10 rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Welcome back!
                  </h1>
                  <p className="text-white/70 text-lg mt-1">
                    Manage your applications and create new ones
                  </p>
                </div>
              </div>
              
              <Button 
                asChild 
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]"
              >
                <Link href="/apps/new" className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New App
                </Link>
              </Button>
            </div>
          </div>

          <DashboardClient initialApps={apps || []} />
        </main>
      </div>
    </div>
  )
}