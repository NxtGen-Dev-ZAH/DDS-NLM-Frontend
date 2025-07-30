import { TotalLogsCard, AnomaliesCard, BlockedIPsCard, UnblockedIPsCard } from '@/components/dashboard/stats-cards'
import { LiveTrafficChart } from '@/components/dashboard/live-traffic-chart'
import { LogsDistributionChart } from '@/components/dashboard/logs-distribution-chart'
import { AttackLogsTable } from '@/components/dashboard/attack-logs'

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Main Content: Left Column (Stats + Live Traffic) and Right Column (Pie Chart + Attack Logs) */}
      <div className="flex-1 grid gap-6 grid-cols-12">
        {/* Left Column: Stats Cards + Live Traffic Chart + Attack Logs */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {/* Stats Cards */}
          <div className="grid gap-0.5 grid-cols-2 lg:grid-cols-4">
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
        
        {/* Right Column: Pie Chart */}
        <div className="col-span-12 lg:col-span-4">
          <LogsDistributionChart />
        </div>
      </div>
    </div>
  )
}
