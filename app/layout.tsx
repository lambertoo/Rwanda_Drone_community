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
    default: "Rwanda UAS Community",
    template: "%s | Rwanda UAS Community",
  },
  description: "Connect with drone enthusiasts, professionals, and businesses across Rwanda",
  applicationName: "Rwanda UAS Community",
  keywords: ["drone", "Rwanda", "UAV", "community", "pilot", "CAA"],
  authors: [{ name: "Rwanda UAS Community" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RUC",
  },
  openGraph: {
    type: "website",
    siteName: "Rwanda UAS Community",
    title: "Rwanda UAS Community Platform",
    description: "The one-stop platform for Rwanda's drone ecosystem",
  },
  twitter: {
    card: "summary",
    title: "Rwanda UAS Community",
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
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${hostGrotesk.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
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
