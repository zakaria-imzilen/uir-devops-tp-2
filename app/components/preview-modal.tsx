"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { App } from "@/lib/types"

interface PreviewModalProps {
  app: App
  isOpen: boolean
  onClose: () => void
}

export function PreviewModal({ app, isOpen, onClose }: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview: {app.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`/apps/${app.id}/preview/render`}
            className="w-full h-full border rounded-md"
            title={`Preview of ${app.name}`}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
