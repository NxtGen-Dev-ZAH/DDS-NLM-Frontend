import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSS Workflow - AI-driven Security Monitoring",
  description: "Decision Support System for real-time network monitoring, intelligent anomaly detection, and autonomous threat response",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen bg-background flex-col">
            {/* Header - spans full width */}
            <Header />
            
            {/* Main content area with sidebar card */}
            <div className="flex-1 flex min-w-0 p-4 gap-4">
              {/* Sidebar Card */}
              <div className="w-64 flex-shrink-0">
                <Sidebar />
              </div>
              
              {/* Page content */}
              <main className="flex-1 overflow-hidden">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
