'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Shield } from 'lucide-react'
import { logsApi } from '@/lib/api'
import { Log } from '@/types'
import { format } from 'date-fns'

// Data matching the reference image exactly
const mockAttackLogs = [
  {
    id: 1,
    timestamp: '2024-01-15T08:21:00Z',
    source_ip: '192.168.47.103',
    destination_ip: '192.168.47.103',
    port: 'TCP',
    threat_type: 'DDos',
    confidence_score: 97
  },
  {
    id: 2,
    timestamp: '2024-01-15T08:21:00Z',
    source_ip: '192.168.47.103',
    destination_ip: '192.168.47.103',
    port: 'TCP',
    threat_type: 'DDos',
    confidence_score: 97
  },
  {
    id: 3,
    timestamp: '2024-01-15T08:21:00Z',
    source_ip: '192.168.47.103',
    destination_ip: '192.168.47.103',
    port: 'TCP',
    threat_type: 'DDos',
    confidence_score: 97
  },
  {
    id: 4,
    timestamp: '2024-01-15T08:21:00Z',
    source_ip: '192.168.47.103',
    destination_ip: '192.168.47.103',
    port: 'TCP',
    threat_type: 'DDos',
    confidence_score: 97
  }
]

export function AttackLogsTable() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttackLogs = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        // const response = await logsApi.getLogs({ is_anomaly: true, limit: 10 })
        // setLogs(response.data)
        
        // Use mock data for now
        setLogs(mockAttackLogs as any)
      } catch (error) {
        console.error('Failed to fetch attack logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttackLogs()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAttackLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'destructive'
    if (score >= 70) return 'secondary'
    return 'default'
  }

  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Attack Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
                    {loading ? (
                      <div className="flex items-center justify-center h-24">
                        <div className="text-muted-foreground">Loading attack logs...</div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs whitespace-nowrap py-2">Time</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-2">Source IP</TableHead>
                    <TableHead className="text-xs whitespace-nowrap hidden sm:table-cell py-2">Destination IP</TableHead>
                    <TableHead className="text-xs whitespace-nowrap hidden md:table-cell py-2">Port</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-2">Threat Type</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-2">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm whitespace-nowrap py-2">
                        {format(new Date(log.timestamp), 'HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap py-2">{log.source_ip}</TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap hidden sm:table-cell py-2">{log.destination_ip}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap hidden md:table-cell py-2">{log.protocol}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="destructive" className="text-xs">
                          {log.is_anomaly ? 'DDos' : 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant={getConfidenceColor(97) as any} className="text-xs">
                          97%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
      </CardContent>
    </Card>
  )
} 