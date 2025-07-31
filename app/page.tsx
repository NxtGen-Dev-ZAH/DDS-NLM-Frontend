import { TotalLogsCard, AnomaliesCard, BlockedIPsCard, UnblockedIPsCard } from '@/components/dashboard/stats-cards'
import { LiveTrafficChart } from '@/components/dashboard/live-traffic-chart'
import { LogsDistributionChart } from '@/components/dashboard/logs-distribution-chart'
import { AttackLogsTable } from '@/components/dashboard/attack-logs'

export default function DashboardPage() {
  return (
    <div className="space-y-3 p-3">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Stats Cards + Live Traffic */}
        <div className="lg:col-span-8 space-y-3">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <TotalLogsCard />
            <AnomaliesCard />
            <BlockedIPsCard />
            <UnblockedIPsCard />
          </div>

          {/* Live Traffic Chart */}
          <div>
            <LiveTrafficChart />
          </div>
        </div>

        {/* Right Column: Logs Distribution Chart */}
        <div className="lg:col-span-4">
          <LogsDistributionChart />
        </div>
      </div>

      {/* Attack Logs Table - Full width below charts */}
      <div className="w-full">
        <AttackLogsTable />
      </div>
    </div>
  )
}
