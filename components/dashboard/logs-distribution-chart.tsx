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

  return (
    <Card className="shadow-sm rounded-xl select-none">
      <CardHeader className="pb-0 pt-0 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Logs Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pb-1 pt-0">
        <div className="grid grid-cols-3 gap-2">
                     {/* Left side: Pie Chart (50% width) */}
           <div className="flex justify-center items-center col-span-2 select-none">
             <div className="w-32 h-32 relative group select-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                                     <Pie
                     data={logsDistributionData}
                     cx="50%"
                     cy="50%"
                     innerRadius={35}
                     outerRadius={55}
                     paddingAngle={0}
                     dataKey="value"
                     stroke="none"
                     strokeWidth={0}
                   >
                                         {logsDistributionData.map((entry, index) => (
                       <Cell 
                         key={`cell-${index}`} 
                         fill={entry.color}
                         stroke="none"
                         strokeWidth={0}
                       />
                     ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right side: Distribution Text (narrower) */}
          <div className="space-y-2 px-0">
            {logsDistributionData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Types below the pie chart */}
        <div className="mt-3 pl-2 pt-2 border-t">
          <h4 className="font-medium mb-2 text-sm">Attack Types</h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {attackTypesData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.type}</span>
                  <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 


