'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, Shield, Search, X } from 'lucide-react'
import { format } from 'date-fns'

// Attack log type definition
interface AttackLog {
  id: number
  timestamp: string
  source_ip: string
  destination_ip: string
  port: string
  threat_type: string
  confidence_score: number
  severity: string
  is_anomaly: boolean
  anomaly_score: number
  ml_model_used: string | null
  raw_log: string
}

// Load attack logs data from JSON file
const loadAttackLogsData = async (): Promise<AttackLog[]> => {
  try {
    const response = await fetch('/attack-logs-data.json')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to load attack logs data:', error)
    return []
  }
}

export function AttackLogsTable() {
  const [logs, setLogs] = useState<AttackLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [allLogs, setAllLogs] = useState<AttackLog[]>([])
  const [selectedLog, setSelectedLog] = useState<AttackLog | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  
  const itemsPerPage = 15 // More items for better content display
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const data = await loadAttackLogsData()
        setAllLogs(data)
        
        // Show first page
        const paginatedData = data.slice(0, itemsPerPage)
        setLogs(paginatedData)
        setHasMore(data.length > itemsPerPage)
        setCurrentPage(2)
      } catch (error) {
        console.error('Failed to fetch attack logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Load more logs for infinite scrolling
  const loadMoreLogs = useCallback(() => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    
    // Simulate API delay
    setTimeout(() => {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const newLogs = allLogs.slice(startIndex, endIndex)
      
      setLogs(prev => [...prev, ...newLogs])
      setHasMore(endIndex < allLogs.length)
      setCurrentPage(prev => prev + 1)
      setLoadingMore(false)
    }, 200)
  }, [loadingMore, hasMore, allLogs, currentPage])

  // Intersection Observer for infinite scrolling
  const lastLogRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore || !hasMore) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreLogs()
      }
    }, {
      rootMargin: '20px',
      threshold: 0.1
    })
    
    if (node) observerRef.current.observe(node)
  }, [loadingMore, hasMore, loadMoreLogs])

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'destructive'
    if (score >= 70) return 'secondary'
    return 'default'
  }

  const handleRowClick = (log: AttackLog) => {
    setSelectedLog(log)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setSelectedLog(null)
  }

  return (
    <>
      <Card className="shadow-sm rounded-xl flex flex-col h-[300px] md:h-[300px] lg:h-[calc(100vh-400px)]">
        <CardHeader className="pb-2 px-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Attack Logs
          </CardTitle>
        </CardHeader>
        
        <CardContent className="py-0 px-3 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground text-sm">Loading attacks...</div>
            </div>
          ) : (
            <div className="overflow-y-auto h-full custom-scrollbar" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
            }}>
              <div className="overflow-x-auto">
                <Table className="min-w-[600px] sm:min-w-0">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-3 w-[80px]">Time</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-3 w-[120px]">Source</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-3 w-[120px]">Destination</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-3 w-[80px]">Port</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-3 w-[100px]">Threat</TableHead>
                      <TableHead className="text-xs whitespace-nowrap py-2 px-3 w-[100px]">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, index) => (
                      <TableRow 
                        key={log.id} 
                        className="hover:bg-accent cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                        onClick={() => handleRowClick(log)}
                      >
                        <TableCell className="font-mono text-xs whitespace-nowrap py-2 px-3">
                          {format(new Date(log.timestamp), 'HH:mm')}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap py-2 px-3">
                          {log.source_ip}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap py-2 px-3">
                          {log.destination_ip}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap py-2 px-3">
                          {log.port}
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Badge variant="destructive" className="text-xs">
                            {log.threat_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Badge variant={getConfidenceColor(log.confidence_score) as any} className="text-xs">
                            {log.confidence_score}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Loading indicator for infinite scroll */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <div className="text-muted-foreground text-sm">Loading more...</div>
                  </div>
                )}
                
                {/* End of data indicator */}
                {!hasMore && logs.length > 0 && (
                  <div className="flex items-center justify-center py-3">
                    <div className="text-muted-foreground text-sm">No more attacks</div>
                  </div>
                )}
                
                {/* Empty state */}
                {!loading && logs.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="text-muted-foreground text-sm font-medium mb-2">No attacks found</div>
                    </div>
                  </div>
                )}
                
                {/* Intersection observer trigger element */}
                {hasMore && !loadingMore && (
                  <div 
                    ref={lastLogRef}
                    className="h-2 w-full"
                    style={{ marginTop: '10px' }}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

            {/* Attack Details Panel - Inline */}
      {selectedLog && isPopupOpen && (
        <Card className="mt-4 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Attack Details
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClosePopup}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Attack Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Timestamp</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedLog.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Confidence</h4>
                    <Badge variant={getConfidenceColor(selectedLog.confidence_score) as any}>
                      {selectedLog.confidence_score}%
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Severity</h4>
                    <Badge variant="outline">
                      {selectedLog.severity}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Threat Type</h4>
                  <Badge variant="destructive">
                    {selectedLog.threat_type}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Network Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Source IP:</span>
                      <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md">{selectedLog.source_ip}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Destination IP:</span>
                      <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md">{selectedLog.destination_ip}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Port:</span>
                      <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md">{selectedLog.port}</p>
                    </div>
                  </div>
                </div>
                
                {selectedLog.ml_model_used && (
                  <div>
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Model Used</span>
                        <Badge variant="outline" className="text-xs">{selectedLog.ml_model_used}</Badge>
                      </div>
                      {selectedLog.is_anomaly && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Anomaly Score</span>
                          <Badge variant="secondary" className="text-xs">{selectedLog.anomaly_score}%</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Raw Log */}
            {selectedLog.raw_log && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Raw Log Data</h4>
                <div className="bg-muted/50 border rounded-lg p-3 max-h-32 overflow-y-auto">
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words overflow-x-auto">
                    {selectedLog.raw_log}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Security Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    console.log(`Terminating attack ${selectedLog.id}`)
                    // TODO: Implement terminate action
                  }}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Terminate Attack
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    console.log(`Quarantining source ${selectedLog.id}`)
                    // TODO: Implement quarantine action
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Quarantine Source
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    console.log(`Unblocking IP ${selectedLog.id}`)
                    // TODO: Implement unblock action
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Unblock IP
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log(`Investigating attack ${selectedLog.id}`)
                    // TODO: Implement investigate action
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Investigate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}   