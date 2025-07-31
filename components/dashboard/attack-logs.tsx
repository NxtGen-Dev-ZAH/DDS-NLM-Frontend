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
    port: 'TCP/443',
    threat_type: 'DDoS',
    confidence_score: 97
  },
  {
    id: 2,
    timestamp: '2024-01-15T08:21:00Z',
    source_ip: '192.168.47.103',
    destination_ip: '192.168.47.103',
    port: 'TCP/22',
    threat_type: 'SSH Brute Force',
    confidence_score: 89
  },
  {
    id: 3,
    timestamp: '2024-01-15T08:21:00Z',
    source_ip: '192.168.47.103',
    destination_ip: '192.168.47.103',
    port: 'TCP/80',
    threat_type: 'DoS',
    confidence_score: 94
  },
  {
    id: 4,
    timestamp: '2024-01-15T08:21:00Z',
    source_ip: '192.168.47.103',
    destination_ip: '192.168.47.103',
    port: 'TCP/3389',
    threat_type: 'Exploit',
    confidence_score: 91
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
      <CardHeader className="pb-0 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Attack Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="py-0.5 px-2">
                    {loading ? (
                      <div className="flex items-center justify-center h-16">
                        <div className="text-muted-foreground">Loading attack logs...</div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-2">Time</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-2">Source IP</TableHead>
                    <TableHead className="text-xs whitespace-nowrap hidden sm:table-cell py-0.5 px-2">Destination IP</TableHead>
                    <TableHead className="text-xs whitespace-nowrap hidden md:table-cell py-0.5 px-2">Port</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-2">Threat Type</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-2">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm whitespace-nowrap py-0 px-2">
                        {format(new Date(log.timestamp), 'HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap py-0 px-2">{log.source_ip}</TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap hidden sm:table-cell py-0 px-2">{log.destination_ip}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap hidden md:table-cell py-0 px-2">{(log as any).port}</TableCell>
                      <TableCell className="py-0 px-2">
                        <Badge variant="destructive" className="text-xs">
                          {(log as any).threat_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-0.5 px-2">
                        <Badge variant={getConfidenceColor((log as any).confidence_score) as any} className="text-xs">
                          {(log as any).confidence_score}%
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