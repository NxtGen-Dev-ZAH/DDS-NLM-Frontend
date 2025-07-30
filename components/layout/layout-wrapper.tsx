'use client'

import { useState } from 'react'
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Fixed at top */}
      <div className="p-2 max-w-7xl mx-auto w-full">
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      </div>
      
      {/* Main content area with sidebar and content */}
      <div className="flex-1 flex gap-3 px-3 pb-2 max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <div className="w-64 flex-shrink-0 hidden md:block">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 z-40 h-full w-64 md:hidden">
              <Sidebar />
            </div>
          </>
        )}
        
        {/* Page content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
} 