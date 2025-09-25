"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { App } from "@/lib/types"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AppCardProps {
  app: App
  onDelete: (id: string) => void
}

export function AppCard({ app, onDelete }: AppCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("apps").delete().eq("id", app.id)

      if (error) throw error
      onDelete(app.id)
    } catch (error) {
      console.error("Error deleting app:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      <div className="relative bg-white/10 backdrop-blur-xl rounded-xl m-[1px]">
        
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            {app.name}
          </CardTitle>
          <CardDescription className="text-white/70">
            Created {formatDate(app.created_at)}
            {app.updated_at !== app.created_at && <span> • Updated {formatDate(app.updated_at)}</span>}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2">
            <Button 
              asChild 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <Link href={`/apps/${app.id}`}>Edit</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="sm"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            >
              <Link href={`/apps/${app.id}/preview`}>Preview</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="bg-red-500/80 hover:bg-red-500 border-0 text-white shadow-md transition-all duration-200"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/70">
                    This action cannot be undone. This will permanently delete your app &quot;{app.name}&quot;.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 text-white hover:bg-red-700 border-0"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}