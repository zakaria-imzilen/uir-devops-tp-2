import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

interface RenderPageProps {
  params: Promise<{ id: string }>
}

export default async function RenderPage({ params }: RenderPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/login")
  }

  // Fetch the app
  const { data: app, error: appError } = await supabase.from("apps").select("*").eq("id", id).single()

  if (appError || !app) {
    notFound()
  }

  // Ensure the user owns this app (RLS should handle this, but double-check)
  if (app.user_id !== userData.user.id) {
    notFound()
  }

  // Create the complete HTML document
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.name}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    }
    ${app.css || ""}
  </style>
</head>
<body>
  ${app.html || '<div style="padding: 20px; text-align: center; color: #666;">No content available</div>'}
  <script>
    ${app.js || ""}
  </script>
</body>
</html>
  `.trim()

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
}
