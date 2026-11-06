import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import {
  Playfair_Display,
  Nunito,
  DM_Sans,
  Inter,
} from 'next/font/google'
import './globals.css'
import { LivingHueAtmosphere } from '@/components/living-hue-atmosphere'

const louizeDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-louize',
  display: 'swap',
})

const nunitoEyebrow = Nunito({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-nunito',
  display: 'swap',
})

const avenirBody = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-avenir',
  display: 'swap',
})

const interUi = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Living Heirloom \u2014 Voice Preservation & Heirloom Studio \u00b7 Powered by Gnani AI',
  description:
    'An empathetic AI biographer powered by Gnani AI. Preserve a loved one\u2019s voice across nine Indian languages and English, conduct acoustic-aware guided interviews, and seal family memories in AES-256 time-locked heirloom capsules.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0e13' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`light ${louizeDisplay.variable} ${nunitoEyebrow.variable} ${avenirBody.variable} ${interUi.variable}`}
    >
      <body className="font-avenir-body relative bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-[#ff5924]/15 selection:text-[var(--accent-ember)]">
        <script dangerouslySetInnerHTML={{__html: "try{var t=localStorage.getItem('living-heirloom-theme');document.documentElement.classList.toggle('dark',t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches));document.documentElement.classList.toggle('light',!document.documentElement.classList.contains('dark'))}catch(e){}"}} />
        <LivingHueAtmosphere />
        {/* Global Tactile Paper Grain Overlay */}
        <div
          aria-hidden="true"
          className="paper-grain-overlay pointer-events-none fixed inset-0 z-[9999]"
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
