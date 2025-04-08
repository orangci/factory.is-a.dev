import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'factory.is-a.dev',
  description: 'The is-a.dev subdomain factory.'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
