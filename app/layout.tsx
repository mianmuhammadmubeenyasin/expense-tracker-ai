import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ExpenseProvider } from '@/lib/expense-context'
import { Sidebar } from '@/components/layout/Sidebar'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Track your personal expenses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`${dmSans.className} antialiased`}>
        <ExpenseProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'var(--font-dm-sans)', fontWeight: 500 },
              success: { style: { background: '#312E81', color: 'white' } },
              error: { style: { background: '#EF4444', color: 'white' } },
            }}
          />
        </ExpenseProvider>
      </body>
    </html>
  )
}
