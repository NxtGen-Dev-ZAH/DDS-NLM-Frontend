'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity } from 'lucide-react'

// Live Traffic Data matching the reference
const liveTrafficData = [
  { time: '12:00 am', logs: 15000, anomalies: 2000 },
  { time: '2:00 am', logs: 12000, anomalies: 1500 },
  { time: '4:00 am', logs: 8000, anomalies: 800 },
  { time: '6:00 am', logs: 10000, anomalies: 1200 },
  { time: '8:00 am', logs: 25000, anomalies: 3500 },
  { time: '10:00 am', logs: 30000, anomalies: 4000 },
  { time: '12:00 pm', logs: 35000, anomalies: 5000 },
  { time: '2:00 pm', logs: 32000, anomalies: 4500 },
  { time: '4:00 pm', logs: 28000, anomalies: 3800 },
  { time: '6:00 pm', logs: 22000, anomalies: 2800 },
  { time: '8:00 pm', logs: 18000, anomalies: 2200 },
  { time: '10:00 pm', logs: 14000, anomalies: 1800 },
  { time: '12:00 am', logs: 12000, anomalies: 1500 },
]

export function LiveTrafficChart() {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="py-0">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Traffic
          </div>
          {/* Legend moved to right side of title */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded"></div>
              <span>Logs</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded"></div>
              <span>Anomalies</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 py-0 m-0">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={liveTrafficData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${value / 1000}k`}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => [value.toLocaleString(), 'Count']}
              labelFormatter={(label) => `Time: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="logs" 
              stroke="#007BFF" 
              strokeWidth={2}
              dot={false}
              name="Logs"
            />
            <Line 
              type="monotone" 
              dataKey="anomalies" 
              stroke="#FFA500" 
              strokeWidth={2}
              dot={false}
              name="Anomalies"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 