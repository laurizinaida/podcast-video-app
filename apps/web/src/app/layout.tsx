import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '智能化在线视频创作平台',
  description: '将播客音频转化为动态视频的智能创作平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}