import type React from "react"
export default function RenderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
