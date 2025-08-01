'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Download, AlertTriangle, Loader2 } from 'lucide-react'
import { logsApi } from '@/lib/api'
import { Log } from '@/types'
import { format } from 'date-fns'

// Generate 150 rows of dummy data with normal and anomaly logs
const generateMockLogs = () => {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'FTP', 'DNS', 'SMTP']
  const ips = ['192.168.1.100', '10.0.0.15', '172.16.0.42', '192.168.47.103', '10.10.10.5', '203.0.113.1', '198.51.100.1', '203.0.113.2']
  const severities = ['info', 'warning', 'error', 'critical'] as const
  
  return Array.from({ length: 150 }, (_, index) => {
    const isAnomaly = Math.random() < 0.3 // 30% chance of anomaly
    const severity: 'info' | 'warning' | 'error' | 'critical' = isAnomaly ? 
      (Math.random() < 0.7 ? 'error' : 'critical') : 
      (Math.random() < 0.6 ? 'info' : 'warning')
    
    return {
      id: index + 1,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      source_ip: ips[Math.floor(Math.random() * ips.length)],
      destination_ip: ips[Math.floor(Math.random() * ips.length)],
      source_port: Math.floor(Math.random() * 65535) + 1,
      destination_port: Math.floor(Math.random() * 65535) + 1,
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      packet_size: Math.floor(Math.random() * 10000) + 64,
      severity,
      is_anomaly: isAnomaly,
      anomaly_score: isAnomaly ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30),
      ml_model_used: isAnomaly ? 'RandomForest' : undefined,
      raw_log: `Sample log entry ${index + 1}`
    }
  })
}

const mockLogs = generateMockLogs()

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [anomalyFilter, setAnomalyFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  
  const itemsPerPage = 20
  const observerRef = useRef<IntersectionObserver>()
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchLogs(true) // Reset to first page
  }, [severityFilter, anomalyFilter])

  const fetchLogs = async (reset?: boolean) => {
    const shouldReset = reset ?? false
    try {
      if (shouldReset) {
        setLoading(true)
        setCurrentPage(1)
      } else {
        setLoadingMore(true)
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Use mock data for now
      let filteredData = [...mockLogs]
      
      // Apply filters
      if (severityFilter !== 'all') {
        filteredData = filteredData.filter(log => log.severity === severityFilter)
      }
      if (anomalyFilter !== 'all') {
        const isAnomaly = anomalyFilter === 'anomaly'
        filteredData = filteredData.filter(log => log.is_anomaly === isAnomaly)
      }
      
      // Apply pagination
      const startIndex = shouldReset ? 0 : (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedData = filteredData.slice(startIndex, endIndex)
      
      if (shouldReset) {
        setLogs(paginatedData)
      } else {
        setLogs(prev => [...prev, ...paginatedData])
      }
      
      setTotalLogs(filteredData.length)
      setHasMore(endIndex < filteredData.length)
      setCurrentPage(prev => prev + 1)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.source_ip.includes(searchTerm) ||
      log.destination_ip.includes(searchTerm) ||
      log.protocol.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'info': return 'default'
      default: return 'default'
    }
  }

  const exportLogs = () => {
    // Implementation for CSV export
    console.log('Exporting logs...')
  }

  // Intersection Observer for infinite scrolling
  const lastLogRef = useCallback((node: HTMLTableRowElement) => {
    if (loadingMore || !hasMore) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        console.log('Loading more logs...')
        fetchLogs()
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [loadingMore, hasMore])

  return (
    <div className="space-y-4">
      {/* Logs Table with integrated filters */}
      <Card className="shadow-sm rounded-xl h-full flex flex-col max-h-[calc(100vh-12vh)]">
        <CardHeader className="pb-2 px-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              System Logs
            </CardTitle>
            <Button onClick={exportLogs} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          {/* Compact Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IPs, protocols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8 text-sm"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={anomalyFilter} onValueChange={setAnomalyFilter}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Anomaly Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="anomaly">Anomalies Only</SelectItem>
                <SelectItem value="normal">Normal Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              Total: {totalLogs.toLocaleString()} logs
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-0.5 px-2 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading logs...</div>
            </div>
          ) : (
            <div className="overflow-auto h-full max-h-[450px] sm:max-h-[500px] md:max-h-[550px] lg:max-h-[calc(100vh-150px)]">
              <div className="overflow-x-auto">
                <Table className="min-w-[600px] sm:min-w-0">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Timestamp</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Source IP</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Destination IP</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Protocol</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Port</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Size</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Severity</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-0.5 px-0 sm:px-0.5 md:px-2">Anomaly</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log, index) => (
                      <TableRow 
                        key={log.id} 
                        ref={index === filteredLogs.length - 1 ? lastLogRef : undefined}
                      >
                        <TableCell className="font-mono text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">
                          {format(new Date(log.timestamp), 'HH:mm')}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">{log.source_ip}</TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">{log.destination_ip}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">{log.protocol}</TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">
                          {log.destination_port}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap py-0 px-0 sm:px-0.5 md:px-2">{log.packet_size.toLocaleString()} B</TableCell>
                        <TableCell className="py-0 px-0 sm:px-0.5 md:px-2">
                          <Badge variant={getSeverityColor(log.severity) as any} className="text-xs">
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-0.5 px-0 sm:px-0.5 md:px-2">
                          {log.is_anomaly ? (
                            <Badge variant="destructive" className="text-xs">Anomaly</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Loading indicator for infinite scroll */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <div className="text-muted-foreground text-sm">Loading more logs...</div>
                  </div>
                )}
                
                {/* End of data indicator */}
                {!hasMore && filteredLogs.length > 0 && (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-muted-foreground text-sm">No more logs to load</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 