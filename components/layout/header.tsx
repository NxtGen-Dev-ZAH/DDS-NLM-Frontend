'use client'

import { Bell, Wifi, WifiOff, Shield, Search, User, Menu, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useWebSocket } from '@/lib/websocket'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { isConnected, connectionError } = useWebSocket()

  return (
    <header className={cn("flex h-16 items-center gap-6 mx-4 mt-4 mb-2 px-6", className)}>
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <Menu className="h-4 w-4 text-muted-foreground" />
        </div>
      </Button>

      {/* DSS WORKFLOW Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">D</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">DSS WORKFLOW</h1>
      </div>

      {/* Centered Search Bar - 300px wide */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-[300px]">
          <div className="absolute left-3 top-1/2 w-6 h-6 bg-muted rounded-full flex items-center justify-center -translate-y-1/2">
            <Search className="h-3 w-3 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search..."
            className="pl-12 rounded-full bg-background/50 border-border/50 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Right side utilities */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isConnected ? (
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                  3
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">New anomaly detected</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">System scan completed</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 