import { TotalLogsCard, AnomaliesCard, BlockedIPsCard, UnblockedIPsCard } from '@/components/dashboard/stats-cards'
import { LiveTrafficChart } from '@/components/dashboard/live-traffic-chart'
import { LogsDistributionChart } from '@/components/dashboard/logs-distribution-chart'
import { AttackLogsTable } from '@/components/dashboard/attack-logs'

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Column: Stats Cards + Live Traffic + Attack Logs */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <TotalLogsCard />
            <AnomaliesCard />
            <BlockedIPsCard />
            <UnblockedIPsCard />
          </div>

          {/* Live Traffic Chart */}
          <div>
            <LiveTrafficChart />
          </div>

          {/* Attack Logs Table */}
          <div>
            <AttackLogsTable />
          </div>
        </div>

        {/* Right Column: Logs Distribution Chart */}
        <div className="lg:col-span-1">
          <LogsDistributionChart />
        </div>
      </div>
    </div>
  )
}
