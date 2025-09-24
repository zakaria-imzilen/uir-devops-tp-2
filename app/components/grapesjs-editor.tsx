"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import type { Editor } from "grapesjs";
import GrapesJsStudio from "@grapesjs/studio-sdk/react";
import { toast } from "@/hooks/use-toast";

import "@grapesjs/studio-sdk/style";

// Default template used when creating a brand new app
const DEFAULT_TEMPLATE_HTML = `
<div class="hero" style="padding:40px; text-align:center; background:linear-gradient(135deg,#f0f4ff,#f9f9fb); border-radius:12px; margin:24px">
  <h1 style="margin:0 0 12px; font-size:32px;">Welcome to your new app</h1>
  <p style="margin:0 0 20px; color:#555;">Start building with GrapesJS components</p>
  <a href="#" class="btn" style="display:inline-block; padding:10px 16px; background:#111827; color:#fff; border-radius:6px; text-decoration:none;">Get Started</a>
  <div style="margin-top:24px; font-size:12px; color:#6b7280;">Edit this content in the editor</div>
</div>`;

const DEFAULT_TEMPLATE_CSS = `
.btn:hover { opacity: 0.9; }
`;

interface GrapesJSEditorProps {
  app?: {
    id?: string;
    name: string;
    html?: string;
    css?: string;
    js?: string;
  };
  isNew?: boolean;
}

export function GrapesJSEditor({ app, isNew = false }: GrapesJSEditorProps) {
  const [appName, setAppName] = useState(app?.name || "");
  const router = useRouter();

  const editorRef = useRef<Editor | null>(null);

  const onReady = (editor: Editor) => {
    console.log("Editor loaded", editor);
    editorRef.current = editor;
    // If editing an existing app, hydrate editor with saved HTML/CSS
    try {
      if (app && (app.html || app.css)) {
        if (app.html) editor.setComponents(app.html);
        if (app.css) editor.setStyle(app.css);
      } else if (isNew) {
        // For new apps, ensure a friendly default view
        editor.setComponents(DEFAULT_TEMPLATE_HTML);
        editor.setStyle(DEFAULT_TEMPLATE_CSS);
      }
    } catch (e) {
      console.error("Failed to load saved content into GrapesJS", e);
    }
  };

  const handleDownload = () => {
    const editor = editorRef.current;
    if (!editor) return;

    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const jsOut = (editor as any)?.getJs ? (editor as any).getJs() : (app?.js || "");
      const name = (appName?.trim() || "index")
        .replace(/\s+/g, "-")
        .toLowerCase();
      const content = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>${appName || "GrapesJS Page"}</title>\n  <style>${css}</style>\n</head>\n<body>\n${html}\n${jsOut ? `<script>${jsOut}</script>` : ""}\n</body>\n</html>`;

      const blob = new Blob([content], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export HTML", e);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const name = appName.trim();
    if (!name) {
      toast({
        title: "App name required",
        description: "Please enter a name before saving.",
        variant: "destructive",
      } as any);
      return;
    }

    try {
      setIsSaving(true);
      const html = editor.getHtml();
      const css = editor.getCss();
      const js = (editor as any)?.getJs ? (editor as any).getJs() : (app?.js || "");

      if (isNew) {
        const res = await fetch("/api/apps/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, html, css, js }),
        });

        console.log(res);

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `Failed to create app (${res.status})`);
        }

        const { data } = await res.json();
        toast({
          title: "App created",
          description: `Saved as “${name}”.`,
        } as any);
        if (data?.id) router.push(`/apps/${data.id}`);
      } else if (app?.id) {
        const res = await fetch(`/api/apps/${app.id}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, html, css, js }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `Failed to update app (${res.status})`);
        }
        toast({ title: "App saved", description: `Updated “${name}”.` } as any);
      } else {
        throw new Error("Missing app id for update");
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Save failed",
        description: e?.message || "Unexpected error",
        variant: "destructive",
      } as any);
    } finally {
      setIsSaving(false);
    }
  };

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
          <Button onClick={handleDownload}>Download HTML</Button>
          <Button onClick={handleSave} disabled={isSaving || !appName.trim()}>
            {isSaving ? "Saving..." : isNew ? "Save" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Editor layout */}
      <div className="flex-1 w-full h-full overflow-hidden">
        <GrapesJsStudio
          onReady={onReady}
          options={{
            licenseKey: "YOUR_LICENSE_KEY",
            project: {
              default: {
                pages: [
                  {
                    name: "Home",
                    component: isNew
                      ? DEFAULT_TEMPLATE_HTML
                      : app?.html || `<h1 style="padding: 2rem; text-align: center">\n  Hello Studio 👋\n</h1>`,
                  },
                ],
              },
            },
          }}
        />
      </div>
    </div>
  );
}
