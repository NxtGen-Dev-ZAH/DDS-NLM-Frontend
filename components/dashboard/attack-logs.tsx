'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock } from 'lucide-react'
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
    <Card className="h-full shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Attack Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-muted-foreground">Loading attack logs...</div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Source IP</TableHead>
                    <TableHead>Destination IP</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Threat Type</TableHead>
                    <TableHead>Confidence Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.timestamp), 'HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono">{log.source_ip}</TableCell>
                      <TableCell className="font-mono">{log.destination_ip}</TableCell>
                      <TableCell>{log.protocol}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {log.is_anomaly ? 'DDos' : 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getConfidenceColor(97) as any}>
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