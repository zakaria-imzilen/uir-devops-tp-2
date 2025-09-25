"use client"

import { AppCard } from "@/components/app-card"
import type { App } from "@/lib/types"
import { useState } from "react"

interface DashboardClientProps {
  initialApps: App[]
}

export function DashboardClient({ initialApps }: DashboardClientProps) {
  const [apps, setApps] = useState<App[]>(initialApps)

  const handleDeleteApp = (id: string) => {
    setApps(apps.filter((app) => app.id !== id))
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No apps yet</h2>
        <p className="text-muted-foreground mb-4">Create your first application to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} onDelete={handleDeleteApp} />
      ))}
    </div>
  )
}
