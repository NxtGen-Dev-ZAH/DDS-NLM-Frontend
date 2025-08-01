'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, AlertTriangle, Loader2 } from 'lucide-react'
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

  const fetchLogs = useCallback(async (reset?: boolean) => {
    const shouldReset = reset ?? false
    try {
      if (shouldReset) {
        setLoading(true)
        setCurrentPage(1)
      } else {
        setLoadingMore(true)
      }

      // Build API parameters
      const params: any = {
        skip: shouldReset ? 0 : (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      }

      // Add filters if not 'all'
      if (severityFilter !== 'all') {
        params.severity = severityFilter
      }
      if (anomalyFilter !== 'all') {
        params.is_anomaly = anomalyFilter === 'anomaly'
      }

      // Call real API
      const response = await logsApi.getLogs(params)
      const newLogs = response.data

      if (shouldReset) {
        setLogs(newLogs)
      } else {
        setLogs(prev => [...prev, ...newLogs])
      }
      
      // Update pagination state
      setHasMore(newLogs.length === itemsPerPage)
      setCurrentPage(prev => prev + 1)
      
      // For total count, we'd need a separate endpoint or response metadata
      // For now, estimate based on current data
      if (shouldReset) {
        setTotalLogs(newLogs.length)
      } else {
        setTotalLogs(prev => prev + newLogs.length)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      // Fallback to mock data if API fails
      console.log('Falling back to mock data...')
      
      let filteredData = [...mockLogs]
      if (severityFilter !== 'all') {
        filteredData = filteredData.filter(log => log.severity === severityFilter)
      }
      if (anomalyFilter !== 'all') {
        const isAnomaly = anomalyFilter === 'anomaly'
        filteredData = filteredData.filter(log => log.is_anomaly === isAnomaly)
      }
      
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
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [currentPage, severityFilter, anomalyFilter, itemsPerPage])

  // Client-side search filtering (since API doesn't support search yet)
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      log.source_ip.toLowerCase().includes(searchLower) ||
      log.destination_ip.toLowerCase().includes(searchLower) ||
      log.protocol.toLowerCase().includes(searchLower)
    )
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
  const lastLogRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore || !hasMore) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        console.log('Loading more logs...')
        fetchLogs(false) // Don't reset, just load more
      }
    }, {
      rootMargin: '100px', // Trigger 100px before the element is visible
      threshold: 0.1
    })
    
    if (node) observerRef.current.observe(node)
  }, [loadingMore, hasMore, fetchLogs])

  return (
    <div className="space-y-4">
      {/* Logs Table with integrated filters */}
             <Card className="shadow-sm rounded-xl h-full flex flex-col max-h-[calc(100vh-0px)]">
        <CardHeader className="pb-4 px-6 flex-shrink-0">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              System Logs
            </CardTitle>
            <Button onClick={exportLogs} variant="outline" size="sm" className="h-9 px-4">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          {/* Filters Section - All in one row */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IPs, protocols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
            
            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-9 w-32 text-sm">
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
            
            {/* Anomaly Filter */}
            <Select value={anomalyFilter} onValueChange={setAnomalyFilter}>
              <SelectTrigger className="h-9 w-36 text-sm">
                <SelectValue placeholder="Anomaly Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="anomaly">Anomalies Only</SelectItem>
                <SelectItem value="normal">Normal Only</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Total Logs Counter */}
            <div className="flex items-center h-9 px-3 bg-muted/30 rounded-md border border-muted-foreground/20">
              <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                {totalLogs.toLocaleString()} logs
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-0 px-2 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading logs...</div>
            </div>
          ) : (
                         <div className="overflow-auto h-full max-h-[calc(100vh-215px)]">
              <div className="overflow-x-auto">
                <Table className="min-w-[600px] sm:min-w-0">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-2">Timestamp</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-2">Source IP</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-2">Destination IP</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-2">Protocol</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-2">Port</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-2">Size</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-2">Severity</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-2">Anomaly</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                                         {filteredLogs.map((log, index) => (
                       <TableRow 
                         key={log.id}
                       >
                        <TableCell className="font-mono text-xs whitespace-nowrap py-2 px-2">
                          {format(new Date(log.timestamp), 'HH:mm')}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap py-2 px-2">{log.source_ip}</TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap py-2 px-2">{log.destination_ip}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap py-2 px-2">{log.protocol}</TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap py-2 px-2">
                          {log.destination_port}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap py-2 px-2">{log.packet_size.toLocaleString()} B</TableCell>
                        <TableCell className="py-2 px-2">
                          <Badge variant={getSeverityColor(log.severity) as any} className="text-xs">
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-2">
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
                   <div className="flex items-center justify-center py-6">
                     <Loader2 className="h-5 w-5 animate-spin mr-3" />
                     <div className="text-muted-foreground text-sm font-medium">Loading more logs...</div>
                   </div>
                 )}
                 
                 {/* End of data indicator */}
                 {!hasMore && filteredLogs.length > 0 && (
                   <div className="flex items-center justify-center py-6">
                     <div className="text-muted-foreground text-sm font-medium">No more logs to load</div>
                   </div>
                 )}
                 
                 {/* Empty state */}
                 {!loading && filteredLogs.length === 0 && (
                   <div className="flex items-center justify-center py-12">
                     <div className="text-center">
                       <div className="text-muted-foreground text-sm font-medium mb-2">No logs found</div>
                       <div className="text-muted-foreground text-xs">Try adjusting your filters or search terms</div>
                     </div>
                   </div>
                 )}
                 
                 {/* Intersection observer trigger element */}
                 {hasMore && !loadingMore && (
                   <div 
                     ref={lastLogRef}
                     className="h-4 w-full"
                     style={{ marginTop: '20px' }}
                   />
                 )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 