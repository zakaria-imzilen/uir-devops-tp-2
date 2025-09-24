"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { App } from "@/lib/types"

interface GrapesJSEditorProps {
  app?: App
  isNew?: boolean
}

export function GrapesJSEditor({ app, isNew = false }: GrapesJSEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [appName, setAppName] = useState(app?.name || "")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let grapesjs: any

    const initEditor = async () => {
      // Dynamically import GrapesJS to avoid SSR issues
      const { default: grapesjs } = await import("grapesjs")

      if (editorRef.current) {
        const editorInstance = grapesjs.init({
          container: editorRef.current,
          height: "100vh",
          width: "100%",
          storageManager: false,
          blockManager: {
            appendTo: ".blocks-container",
          },
          layerManager: {
            appendTo: ".layers-container",
          },
          traitManager: {
            appendTo: ".traits-container",
          },
          selectorManager: {
            appendTo: ".styles-container",
          },
          panels: {
            defaults: [
              {
                id: "basic-actions",
                el: ".panel__basic-actions",
                buttons: [
                  {
                    id: "visibility",
                    active: true,
                    className: "btn-toggle-borders",
                    label: '<i class="fa fa-clone"></i>',
                    command: "sw-visibility",
                  },
                ],
              },
              {
                id: "panel-devices",
                el: ".panel__devices",
                buttons: [
                  {
                    id: "device-desktop",
                    label: '<i class="fa fa-television"></i>',
                    command: "set-device-desktop",
                    active: true,
                    togglable: false,
                  },
                  {
                    id: "device-mobile",
                    label: '<i class="fa fa-mobile"></i>',
                    command: "set-device-mobile",
                    togglable: false,
                  },
                ],
              },
            ],
          },
          deviceManager: {
            devices: [
              {
                name: "Desktop",
                width: "",
              },
              {
                name: "Mobile",
                width: "320px",
                widthMedia: "480px",
              },
            ],
          },
        })

        // Load existing content if editing
        if (app && !isNew) {
          if (app.html) editorInstance.setComponents(app.html)
          if (app.css) editorInstance.setStyle(app.css)
        }

        setEditor(editorInstance)
      }
    }

    initEditor()

    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [app, isNew])

  const handleSave = async () => {
    if (!editor || !appName.trim()) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const html = editor.getHtml()
      const css = editor.getCss()
      const js = editor.getJs()

      if (isNew) {
        // Create new app
        const { data, error } = await supabase
          .from("apps")
          .insert({
            name: appName.trim(),
            html,
            css,
            js,
          })
          .select()
          .single()

        if (error) throw error

        router.push(`/apps/${data.id}`)
      } else if (app) {
        // Update existing app
        const { error } = await supabase
          .from("apps")
          .update({
            name: appName.trim(),
            html,
            css,
            js,
          })
          .eq("id", app.id)

        if (error) throw error

        // Show success message or redirect
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving app:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top toolbar */}
      <div className="border-b bg-background p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="app-name">App Name:</Label>
            <Input
              id="app-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Enter app name"
              className="w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !appName.trim()}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Editor layout */}
      <div className="flex-1 flex">
        {/* Left sidebar */}
        <div className="w-64 border-r bg-muted/30 flex flex-col">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Blocks</h3>
            <div className="blocks-container"></div>
          </div>
        </div>

        {/* Main editor */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-2 flex items-center gap-2">
            <div className="panel__devices"></div>
            <div className="panel__basic-actions"></div>
          </div>
          <div className="flex-1">
            <div ref={editorRef} className="h-full"></div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 border-l bg-muted/30 flex flex-col">
          <div className="p-4">
            <h3 className="font-semibold mb-2">Layers</h3>
            <div className="layers-container mb-4"></div>

            <h3 className="font-semibold mb-2">Properties</h3>
            <div className="traits-container mb-4"></div>

            <h3 className="font-semibold mb-2">Styles</h3>
            <div className="styles-container"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
