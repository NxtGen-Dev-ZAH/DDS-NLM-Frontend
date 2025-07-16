import { StatsCards } from '@/components/dashboard/stats-cards'
import { RealTimeLogs } from '@/components/dashboard/real-time-logs'
import { IncidentsPanel } from '@/components/dashboard/incidents-panel'
import { AiChat } from '@/components/dashboard/ai-chat'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time network monitoring and threat detection system
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsCards />

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Real-time Logs - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RealTimeLogs />
        </div>

        {/* AI Chat Assistant */}
        <div className="lg:col-span-1">
          <AiChat />
        </div>
      </div>

      {/* Incidents Panel - Full width */}
      <IncidentsPanel />
    </div>
  )
}
