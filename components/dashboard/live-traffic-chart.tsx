'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity } from 'lucide-react'

// Generate detailed data points every 10 minutes for a 24-hour period
const generateDetailedData = () => {
  const data = []
  const startTime = new Date('2024-01-01 00:00:00')
  
  for (let i = 0; i < 144; i++) { // 24 hours * 6 (10-minute intervals per hour)
    const time = new Date(startTime.getTime() + i * 10 * 60 * 1000) // Add 10 minutes each time
    
    // Generate realistic traffic patterns
    const hour = time.getHours()
    let baseLogs = 8000
    let baseAnomalies = 800
    
    // Peak hours (9 AM - 5 PM)
    if (hour >= 9 && hour <= 17) {
      baseLogs = 25000 + Math.sin((hour - 9) * Math.PI / 8) * 10000
      baseAnomalies = 3000 + Math.sin((hour - 9) * Math.PI / 8) * 2000
    }
    // Evening hours (6 PM - 10 PM)
    else if (hour >= 18 && hour <= 22) {
      baseLogs = 18000 + Math.sin((hour - 18) * Math.PI / 4) * 5000
      baseAnomalies = 2000 + Math.sin((hour - 18) * Math.PI / 4) * 1000
    }
    // Night hours (11 PM - 8 AM)
    else {
      baseLogs = 8000 + Math.sin((hour - 23) * Math.PI / 9) * 4000
      baseAnomalies = 800 + Math.sin((hour - 23) * Math.PI / 9) * 400
    }
    
    // Add some random variation
    const logs = Math.max(1000, baseLogs + (Math.random() - 0.5) * 3000)
    const anomalies = Math.max(100, baseAnomalies + (Math.random() - 0.5) * 800)
    
    data.push({
      time: time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      logs: Math.round(logs),
      anomalies: Math.round(anomalies),
      timestamp: time.getTime()
    })
  }
  
  return data
}

const initialData = generateDetailedData()

export function LiveTrafficChart() {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="py-0">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Traffic
          </div>
          {/* Legend */}
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
          <LineChart data={initialData.slice(-48)}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval={7} // Show every 8th tick (1.5 hours = 8 * 10 minutes)
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