import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistem Musyawarah PPG',
  description: 'Sistem Manajemen Musyawarah PPG dengan Notulensi dan Absensi',
  keywords: 'PPG, musyawarah, notulensi, absensi, pendidikan',
  authors: [{ name: 'PPG Indonesia' }],
  themeColor: '#3b82f6',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="indonesian-content">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}