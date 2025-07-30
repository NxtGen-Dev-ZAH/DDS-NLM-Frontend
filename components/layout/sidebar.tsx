'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Bot, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Home,
  FileText,
  Brain
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: number
  children?: NavItem[]
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle, badge: 5 },
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar Card */}
      <Card className={cn(
        "h-full bg-card border rounded-lg shadow-sm transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-full md:translate-x-0",
        className
      )}>
        <div className="flex h-full flex-col p-4">
          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "secondary" : "default"} 
                        className="h-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t pt-4 mt-auto">
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                A
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium">Admin User</div>
                <div className="text-muted-foreground">admin@dss.local</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
} 