import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Codings",
  description: "Codings is a typing game that helps you improve your coding speed and accuracy.",
  openGraph: {
    title: "codings_",
    description: "Type faster. Code better. A typing game for developers.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "codings_ - A typing game for developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "codings_",
    description: "Type faster. Code better. A typing game for developers.",
    images: ["/api/og"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
