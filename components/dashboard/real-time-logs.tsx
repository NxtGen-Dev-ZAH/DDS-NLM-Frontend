'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Play, 
  Pause, 
  AlertTriangle, 
  Shield, 
  Eye,
  Filter,
  Download
} from 'lucide-react'
import { useRealtimeLogs, useWebSocket } from '@/lib/websocket'
import { logsApi, handleApiError } from '@/lib/api'
import { Log } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface RealTimeLogsProps {
  className?: string
}

export function RealTimeLogs({ className }: RealTimeLogsProps) {
  const [isLive, setIsLive] = useState(true)
  const [staticLogs, setStaticLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const realtimeLogs = useRealtimeLogs()
  const { isConnected } = useWebSocket()

  // Fetch initial logs
  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        setLoading(true)
        const response = await logsApi.getLogs({ limit: 50 })
        setStaticLogs(response.data)
        setError(null)
      } catch (err) {
        setError(handleApiError(err))
        console.error('Failed to fetch initial logs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialLogs()
  }, [])

  // Combine static and real-time logs
  const allLogs = isLive ? [...realtimeLogs, ...staticLogs] : staticLogs
  const displayLogs = allLogs.slice(0, 100) // Limit to 100 most recent

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      error: 'destructive',
      warning: 'secondary',
      info: 'outline'
    } as const

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const getAnomalyIcon = (isAnomaly: boolean) => {
    return isAnomaly ? (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    ) : (
      <Shield className="h-4 w-4 text-green-500" />
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Real-time Log Monitor</CardTitle>
            {isConnected && isLive && (
              <Badge variant="outline" className="text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                Live
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              disabled={!isConnected}
            >
              {isLive ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              )}
            </Button>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading logs...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Failed to load logs: {error}</span>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Status</TableHead>
                  <TableHead className="w-32">Time</TableHead>
                  <TableHead className="w-32">Source IP</TableHead>
                  <TableHead className="w-32">Dest IP</TableHead>
                  <TableHead className="w-20">Protocol</TableHead>
                  <TableHead className="w-24">Severity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No logs available
                    </TableCell>
                  </TableRow>
                ) : (
                  displayLogs.map((log, index) => (
                    <TableRow 
                      key={log.id || index}
                      className={cn(
                        log.is_anomaly && "bg-red-50 dark:bg-red-950/20",
                        index < realtimeLogs.length && isLive && "animate-pulse"
                      )}
                    >
                      <TableCell>
                        {getAnomalyIcon(log.is_anomaly)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.source_ip}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.destination_ip}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.protocol}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(log.severity)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="max-w-md truncate">
                          {log.is_anomaly && (
                            <span className="text-red-600 font-medium mr-2">
                              ANOMALY DETECTED
                            </span>
                          )}
                          Port {log.source_port} → {log.destination_port}
                          {log.packet_size && ` | ${log.packet_size} bytes`}
                          {log.anomaly_score && (
                            <span className="text-orange-600 ml-2">
                              Score: {log.anomaly_score.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Showing {displayLogs.length} logs</span>
            {realtimeLogs.length > 0 && (
              <span className="text-green-600">
                {realtimeLogs.length} new since page load
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="h-3 w-3" />
            <span>
              Connection: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 