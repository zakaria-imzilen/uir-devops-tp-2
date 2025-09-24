"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Editor } from "grapesjs";
import GrapesJsStudio, {
  StudioCommands,
  ToastVariant,
} from "@grapesjs/studio-sdk/react";

import "@grapesjs/studio-sdk/style";

interface GrapesJSEditorProps {
  app?: {
    name: string;
  };
  isNew?: boolean;
}

export function GrapesJSEditor({ app, isNew = false }: GrapesJSEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [appName, setAppName] = useState(app?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [editor, setEditor] = useState<Editor>();

  const onReady = (editor: Editor) => {
    console.log("Editor loaded", editor);
    setEditor(editor);
  };

  const showToast = (id: string) =>
    editor?.runCommand(StudioCommands.toastAdd, {
      id,
      header: "Toast header",
      content: "Data logged in console",
      variant: ToastVariant.Info,
    });

  const getProjetData = () => {
    if (editor) {
      console.log({ projectData: editor?.getProjectData() });
      showToast("log-project-data");
    }
  };

  const getExportData = () => {
    if (editor) {
      console.log({ html: editor?.getHtml(), css: editor?.getCss() });
      showToast("log-html-css");
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
