'use client'

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  Ban,
  Unlock,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const mockStats = {
  totalLogs: 2031,
  anomalies: 205,
  blockedIPs: 137,
  unblockedIPs: 5,
}

// Shared styling
const cardStyle = 'bg-card border rounded-xl px-2 py-1.5 h-16 shadow-sm'

function StatCard({
  title,
  value,
  icon,
  iconColor,
  delta,
  deltaType,
}: {
  title: string
  value: string | number
  icon: React.ReactElement
  iconColor: string
  delta: string
  deltaType: 'up' | 'down'
}) {
  return (
    <Card className={cardStyle}>
      <div className="flex flex-col justify-between h-full">
        {/* Top: Title + Icon */}
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="truncate">{title}</span>
          <div className={cn('h-3 w-3 flex-shrink-0, pr-6', iconColor)}>{icon}</div>
        </div>

        {/* Middle: Value */}
        <div className="text-sm font-bold text-foreground leading-none">
          {value}
        </div>

        {/* Bottom: Delta */}
        <p className={cn(
          "text-[8px] leading-none flex items-center",
          deltaType === 'up' ? 'text-green-600' : 'text-red-600'
        )}>
          {deltaType === 'up' ? (
            <TrendingUp className="inline h-2 w-2 mr-1" />
          ) : (
            <TrendingDown className="inline h-2 w-2 mr-1" />
          )}
          {delta}
        </p>
      </div>
    </Card>
  )
}

// Individual stat cards
export function TotalLogsCard() {
  return (
    <StatCard
      title="Total Logs"
      value={mockStats.totalLogs.toLocaleString()}
      icon={<FileText />}
      iconColor="text-blue-500"
      delta="+101"
      deltaType="up"
    />
  )
}

export function AnomaliesCard() {
  return (
    <StatCard
      title="Anomalies"
      value={mockStats.anomalies}
      icon={<AlertTriangle />}
      iconColor="text-orange-500"
      delta="+24"
      deltaType="up"
    />
  )
}

export function BlockedIPsCard() {
  return (
    <StatCard
      title="Blocked IPs"
      value={mockStats.blockedIPs}
      icon={<Ban />}
      iconColor="text-red-500"
      delta="+10"
      deltaType="up"
    />
  )
}

export function UnblockedIPsCard() {
  return (
    <StatCard
      title="Unblocked IPs"
      value={mockStats.unblockedIPs.toString().padStart(2, '0')}
      icon={<Unlock />}
      iconColor="text-green-500"
      delta="-1"
      deltaType="down"
    />
  )
}

export function StatsCards({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      <TotalLogsCard />
      <AnomaliesCard />
      <BlockedIPsCard />
      <UnblockedIPsCard />
    </div>
  )
}
