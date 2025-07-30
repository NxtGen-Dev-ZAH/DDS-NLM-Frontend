'use client'

import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  AlertTriangle, 
  Ban, 
  Unlock 
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
const cardStyle = "bg-card border rounded-lg px-3 py-2 h-20 shadow-sm"

function StatCard({
  title,
  value,
  icon,
  iconColor,
  delta,
  deltaType,
}: {
  title: string,
  value: string | number,
  icon: React.ReactElement,
  iconColor: string,
  delta: string,
  deltaType: 'up' | 'down'
}) {
    return (
    <Card className={cardStyle}>
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-0.5">
        <span>{title}</span>
        <div className={cn("h-4 w-4", iconColor)}>{icon}</div>
      </div>
      <div className="text-lg font-bold text-foreground leading-none">{value}</div>
      <p className="text-[10px] text-muted-foreground leading-none mt-0.5">


        {deltaType === 'up' ? (
          <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
        ) : (
          <TrendingDown className="inline h-3 w-3 mr-1 text-red-500" />
        )}
        {delta}
      </p>
    </Card>
  )
}

// Export individual card components for backward compatibility
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
      iconColor="text-red-600"
      delta="-1"
      deltaType="down"
    />
  )
}

export function StatsCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3 grid-cols-2 lg:grid-cols-4", className)}>
      <TotalLogsCard />
      <AnomaliesCard />
      <BlockedIPsCard />
      <UnblockedIPsCard />
    </div>
  )
}
