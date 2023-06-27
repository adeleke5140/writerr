import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Writerr',
  description: 'A modern WYSIWYG editor for the web',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" sizes="any" href="/favicon.ico" />
        </head>
        <body className={inter.className}>
          <nav className='fixed right-8 top-8 z-40'>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                afterMultiSessionSingleSignOutUrl="/"
                afterSwitchSessionUrl="/"
                appearance={{ variables: { colorPrimary: "#000" } }}
              />
            </SignedIn>
            <SignedOut>
            </SignedOut>
          </nav>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
