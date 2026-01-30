import './globals.css'

export const metadata = {
  title: 'JobFeed - LinkedIn Job Opportunities',
  description: 'Agrégateur intelligent d\'opportunités LinkedIn',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
