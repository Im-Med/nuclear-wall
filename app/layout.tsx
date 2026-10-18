import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ModalProvider } from '@/components/nuclear/modal-provider'
import { NuclearProvider } from '@/lib/nuclear-store'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Nuclear Wall — Unbreakable Focus',
  description:
    'Nuclear Wall locks distractions behind an unbreakable commitment. Schedule focus blocks, run standalone focus modes, and stay accountable.',
  generator: 'v0.app',
  icons: {
    icon: '/nuclear-shield.svg',
    apple: '/nuclear-shield.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#14171d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <NuclearProvider>
          <ModalProvider>{children}</ModalProvider>
        </NuclearProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
