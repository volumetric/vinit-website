import React from 'react';
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { AuthProvider } from '@/app/components/AuthProvider'

// Check if the font is properly initialized
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Vinit Agrawal - Personal Website",
  description: "Personal website of Vinit Agrawal. Computer Programmer by Profession. Founder & CTO of TARS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <body data-new-gr-c-s-check-loaded="" data-gr-ext-installed="" className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <div className="flex min-h-screen flex-col">
              <header className="container">
                <MainNav />
              </header>
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </AuthProvider>
    </html>
  )
}
