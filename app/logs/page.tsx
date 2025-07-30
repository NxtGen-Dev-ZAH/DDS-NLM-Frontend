'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Download } from 'lucide-react'
import { logsApi } from '@/lib/api'
import { Log } from '@/types'
import { format } from 'date-fns'

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [anomalyFilter, setAnomalyFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  const itemsPerPage = 20

  useEffect(() => {
    fetchLogs()
  }, [currentPage, severityFilter, anomalyFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params: any = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      }

      if (severityFilter !== 'all') {
        params.severity = severityFilter
      }
      if (anomalyFilter !== 'all') {
        params.is_anomaly = anomalyFilter === 'anomaly'
      }

      const response = await logsApi.getLogs(params)
      setLogs(response.data)
      // Note: Backend should return pagination info
      setTotalLogs(response.data.length) // This should be updated with actual total
      setTotalPages(Math.ceil(response.data.length / itemsPerPage))
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">
            Comprehensive view of all network activity and security events
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IPs, protocols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading logs...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Source IP</TableHead>
                    <TableHead>Destination IP</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Ports</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Anomaly</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-mono">{log.source_ip}</TableCell>
                      <TableCell className="font-mono">{log.destination_ip}</TableCell>
                      <TableCell>{log.protocol}</TableCell>
                      <TableCell className="font-mono">
                        {log.source_port} → {log.destination_port}
                      </TableCell>
                      <TableCell>{log.packet_size.toLocaleString()} B</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(log.severity) as any}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.is_anomaly ? (
                          <Badge variant="destructive">Anomaly</Badge>
                        ) : (
                          <Badge variant="secondary">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 