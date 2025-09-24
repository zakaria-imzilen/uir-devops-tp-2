"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import type { Editor } from "grapesjs";
import GrapesJsStudio from "@grapesjs/studio-sdk/react";

import "@grapesjs/studio-sdk/style";

interface GrapesJSEditorProps {
  app?: {
    name: string;
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
  };

  const handleDownload = () => {
    const editor = editorRef.current;
    if (!editor) return;

    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const name = (appName?.trim() || "index").replace(/\s+/g, "-").toLowerCase();
      const content = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>${appName || "GrapesJS Page"}</title>\n  <style>${css}</style>\n</head>\n<body>\n${html}\n</body>\n</html>`;

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
          <Button onClick={handleDownload}>
            Download HTML
          </Button>
          {/* <Button onClick={handleSave} disabled={isSaving || !appName.trim()}>
            {isSaving ? "Saving..." : "Save"}
          </Button> */}
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
                    component: `<h1 style="padding: 2rem; text-align: center">
                      Hello Studio 👋
                    </h1>`,
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
