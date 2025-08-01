'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock } from 'lucide-react'
import { logsApi } from '@/lib/api'
import { Log } from '@/types'
import { format } from 'date-fns'

// Generate 50 rows of dummy data
const generateMockAttackLogs = () => {
  const threatTypes = ['DDoS', 'SSH Brute Force', 'DoS', 'Exploit', 'SQL Injection', 'XSS', 'Ransomware', 'Phishing']
  const ports = ['TCP/443', 'TCP/22', 'TCP/80', 'TCP/3389', 'TCP/21', 'TCP/25', 'UDP/53', 'TCP/8080']
  const ips = ['192.168.47.103', '10.0.0.15', '172.16.0.42', '192.168.1.100', '10.10.10.5']
  
  return Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    source_ip: ips[Math.floor(Math.random() * ips.length)],
    destination_ip: ips[Math.floor(Math.random() * ips.length)],
    port: ports[Math.floor(Math.random() * ports.length)],
    threat_type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
    confidence_score: Math.floor(Math.random() * 30) + 70 // 70-99
  }))
}

const mockAttackLogs = generateMockAttackLogs()

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
    <Card className="shadow-sm rounded-xl h-full flex flex-col max-h-[400px] sm:max-h-[450px] md:max-h-[500px] lg:max-h-[calc(100vh-400px)]">
      <CardHeader className="pb-0 px-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Attack Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="py-0.5 px-2 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading attack logs...</div>
          </div>
        ) : (
          <div className="overflow-auto h-full max-h-[300px] sm:max-h-[350px] md:max-h-[400px] lg:max-h-[calc(100vh-380px)]">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px] sm:min-w-0">
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Time</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Source IP</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Destination IP</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Port</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Threat Type</TableHead>
                    <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">
                        {format(new Date(log.timestamp), 'HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">{log.source_ip}</TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">{log.destination_ip}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">{(log as any).port}</TableCell>
                      <TableCell className="py-0 px-0 sm:px-0.5 md:px-2">
                        <Badge variant="destructive" className="text-xs">
                          {(log as any).threat_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-0.5 px-0 sm:px-0.5 md:px-2">
                        <Badge variant={getConfidenceColor((log as any).confidence_score) as any} className="text-xs">
                          {(log as any).confidence_score}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}   