import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Poker Estimation App",
  description: "Real-time story estimation for agile teams.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-gray-50 min-h-screen flex flex-col")}>
        <header className="bg-header-gradient text-white shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold">Zühlke Poker</h1>
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
        <footer className="bg-footer text-white py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
            &copy; 2025 Poker Estimation App. All rights reserved.
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  )
}
