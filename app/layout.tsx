import type React from "react"
import type { Metadata, Viewport } from "next"
import { Host_Grotesk } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { LoginLayout } from "@/components/login-layout"
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/components/ui/notification"
import { AuthProvider } from "@/lib/auth-context"
import { I18nProvider } from "@/lib/i18n-context"
import { PWARegister } from "@/components/pwa-register"

const hostGrotesk = Host_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

export const metadata: Metadata = {
  title: {
    default: "Rwanda Drone Community",
    template: "%s | Rwanda Drone Community",
  },
  description: "Connect with drone enthusiasts, professionals, and businesses across Rwanda",
  applicationName: "Rwanda Drone Community",
  keywords: ["drone", "Rwanda", "UAV", "community", "pilot", "CAA"],
  authors: [{ name: "Rwanda Drone Community" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RDC",
  },
  openGraph: {
    type: "website",
    siteName: "Rwanda Drone Community",
    title: "Rwanda Drone Community Platform",
    description: "The one-stop platform for Rwanda's drone ecosystem",
  },
  twitter: {
    card: "summary",
    title: "Rwanda Drone Community",
    description: "The one-stop platform for Rwanda's drone ecosystem",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${hostGrotesk.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <AuthProvider>
              <NotificationProvider>
                <LoginLayout>
                  {children}
                </LoginLayout>
                <Toaster />
                <PWARegister />
              </NotificationProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
