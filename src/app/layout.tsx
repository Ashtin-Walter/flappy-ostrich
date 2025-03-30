import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flappy Ostrich',
  description: 'A fun Flappy Bird-style game featuring an ostrich',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Footer />
      </body>
    </html>
  )
}