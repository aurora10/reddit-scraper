import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import '@/styles/analytics.css'
import { GradientBackground } from '@/components/ui/gradient-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reddit Analytics Platform',
  description: 'Analyze and gain insights from various subreddits',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <GradientBackground className="min-h-screen">
            <main className="w-full">
              {children}
            </main>
          </GradientBackground>
        </Providers>
      </body>
    </html>
  )
}