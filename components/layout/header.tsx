'use client'

import {
  Bell,
  Wifi,
  WifiOff,
  Shield,
  Search,
  User,
  Menu,
  AlertTriangle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { SearchResults } from '@/components/ui/search-results'
import { useWebSocket } from '@/lib/websocket'
import { useSearch } from '@/lib/search-context'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface HeaderProps {
  className?: string
  onMobileMenuToggle?: () => void
}

export function Header({ className, onMobileMenuToggle }: HeaderProps) {
  const { isConnected } = useWebSocket()
  const { 
    query, 
    results, 
    isLoading, 
    isOpen, 
    setQuery, 
    setIsOpen, 
    clearSearch 
  } = useSearch()
  const searchRef = useRef<HTMLDivElement>(null)

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsOpen])

  const handleSearchChange = (value: string) => {
    setQuery(value)
    if (value.trim()) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleResultClick = (result: any) => {
    // Search result clicked - navigation will be handled by the SearchResults component
    setIsOpen(false)
  }

  return (
    <div
      className={cn(
        'flex flex-row h-12 items-center justify-between px-3 sm:px-4 relative z-10',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuToggle}
        >
          <div className="w-6 h-6 bg-card rounded-full flex items-center justify-center">
            <Menu className="h-3 w-3" />
          </div>
        </Button>

        {/* DSS WORKFLOW Title */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-xs">D</span>
          </div>
          <h1 className="text-sm font-bold tracking-wide text-foreground">
            DSS WORKFLOW
          </h1>
        </div>
      </div>

      {/* Center Section - Search Bar */}
      <div className="flex-1 flex justify-center max-w-sm mx-4">
        <div className="relative w-full" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 z-10" />
          <Input
            placeholder="Search logs, incidents, attacks..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-8 py-1.5 rounded-full text-sm bg-card border-border/60 backdrop-blur-sm"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isOpen && (
            <SearchResults
              results={results}
              isLoading={isLoading}
              onResultClick={handleResultClick}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-6 h-6 bg-card rounded-full flex items-center justify-center">
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Theme Toggle */}
        <div className="w-6 h-6 bg-card rounded-full flex items-center justify-center">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <div className="w-6 h-6 bg-card rounded-full flex items-center justify-center">
                <Bell className="h-3 w-3" />
                <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 text-[8px] leading-none bg-primary">
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
                <AlertTriangle className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">New anomaly detected</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
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
              <div className="w-6 h-6 bg-card rounded-full flex items-center justify-center">
                <User className="h-3 w-3" />
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
    </div>
  )
}
