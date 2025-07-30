'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { AlertTriangle } from 'lucide-react'

// Data matching the reference image exactly
const logsDistributionData = [
  { name: 'Normal', value: 60.7, color: '#3b82f6' }, // Blue
  { name: 'Attacks', value: 28.0, color: '#f97316' }, // Orange  
  { name: 'Blocked', value: 11.3, color: '#ef4444' }, // Red
]

// Attack types matching the reference image
const attackTypesData = [
  { type: 'Generic', percentage: 12.3, color: '#f97316' }, // Orange
  { type: 'Exploits', percentage: 8.0, color: '#ef4444' }, // Red
  { type: 'Fuzzers', percentage: 5.3, color: '#f97316' }, // Orange
  { type: 'DoS', percentage: 2.4, color: '#ef4444' }, // Red
]

export function LogsDistributionChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Logs Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Left side: Pie Chart (50% width) */}
          <div className="flex justify-center items-center">
            <div className="w-24 h-24 relative group">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={logsDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {logsDistributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="none"
                        style={{
                          cursor: 'pointer',
                          filter: hoveredIndex === index ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.1)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right side: Distribution Text (vertical layout) */}
          <div className="space-y-1 px-1">
            {logsDistributionData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Types below the pie chart */}
        <div className="mt-2 pl-2 pt-1 border-t">
          <h4 className="font-medium mb-1 text-xs">Attack Types</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {attackTypesData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-1.5 h-1.5 rounded" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{item.type}</span>
                  <span className="text-[10px] text-muted-foreground">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 