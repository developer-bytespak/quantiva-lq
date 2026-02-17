import type { Metadata } from 'next'
import './globals.css'
import ScrollToTop from '@/components/ScrollToTop'
import ContactFormPopup from '@/components/ContactFormPopup'

export const metadata: Metadata = {
  title: 'Quantiva - Landing Page',
  description: 'Welcome to Quantiva',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ScrollToTop />
        <ContactFormPopup />
        {children}
      </body>
    </html>
  )
}

