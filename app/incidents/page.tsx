'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, AlertTriangle, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { incidentsApi } from '@/lib/api'
import { Incident } from '@/types'
import { format } from 'date-fns'

// Generate mock incidents data
const generateMockIncidents = () => {
  const titles = [
    'Suspicious Login Attempt',
    'DDoS Attack Detected',
    'Malware Infection',
    'Data Exfiltration Attempt',
    'Brute Force Attack',
    'SQL Injection Attempt',
    'Cross-Site Scripting',
    'Privilege Escalation'
  ]
  
  const descriptions = [
    'Multiple failed login attempts from unknown IP address',
    'Distributed denial of service attack targeting web servers',
    'Malicious software detected on endpoint devices',
    'Unauthorized data transfer to external servers',
    'Repeated password attempts from multiple sources',
    'SQL injection attempt on login form',
    'XSS payload detected in user input',
    'Unauthorized access to administrative functions'
  ]
  
  const statuses = ['open', 'in_progress', 'resolved', 'closed'] as const
  const severities = ['critical', 'high', 'medium', 'low'] as const
  const ips = ['192.168.1.100', '10.0.0.15', '172.16.0.42', '192.168.47.103']
  
  return Array.from({ length: 100 }, (_, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const isCritical = severity === 'critical' || severity === 'high'
    const isBlocked = Math.random() < 0.4 // 40% chance of being blocked
    
    return {
      id: index + 1,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      status,
      severity,
      affected_ips: ips[Math.floor(Math.random() * ips.length)],
      attack_vector: isCritical ? 'Network-based' : 'Application-based',
      recommended_actions: isCritical ? 'Immediate isolation and investigation required' : 'Monitor and investigate',
      is_blocked: isBlocked,
      is_quarantined: isBlocked && Math.random() < 0.3, // 30% of blocked are quarantined
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  })
}

const mockIncidents = generateMockIncidents()

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalIncidents, setTotalIncidents] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  
  const itemsPerPage = 20
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    fetchIncidents(true) // Reset to first page
  }, [statusFilter, severityFilter])

  const fetchIncidents = useCallback(async (reset?: boolean) => {
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
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (severityFilter !== 'all') {
        params.severity = severityFilter
      }

      // Call real API
      const response = await incidentsApi.getIncidents(params)
      const newIncidents = response.data

      if (shouldReset) {
        setIncidents(newIncidents)
      } else {
        setIncidents(prev => [...prev, ...newIncidents])
      }
      
      // Update pagination state
      setHasMore(newIncidents.length === itemsPerPage)
      setCurrentPage(prev => prev + 1)
      
      // For total count, we'd need a separate endpoint or response metadata
      // For now, estimate based on current data
      if (shouldReset) {
        setTotalIncidents(newIncidents.length)
      } else {
        setTotalIncidents(prev => prev + newIncidents.length)
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
      // Fallback to mock data if API fails
      console.log('Falling back to mock data...')
      
      let filteredData = [...mockIncidents]
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(incident => incident.status === statusFilter)
      }
      if (severityFilter !== 'all') {
        filteredData = filteredData.filter(incident => incident.severity === severityFilter)
      }
      
      const startIndex = shouldReset ? 0 : (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedData = filteredData.slice(startIndex, endIndex)
      
      if (shouldReset) {
        setIncidents(paginatedData)
      } else {
        setIncidents(prev => [...prev, ...paginatedData])
      }
      
      setTotalIncidents(filteredData.length)
      setHasMore(endIndex < filteredData.length)
      setCurrentPage(prev => prev + 1)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [currentPage, statusFilter, severityFilter, itemsPerPage])

  // Client-side search filtering (since API doesn't support search yet)
  const filteredIncidents = incidents.filter(incident => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      incident.title.toLowerCase().includes(searchLower) ||
      incident.description.toLowerCase().includes(searchLower) ||
      (incident.affected_ips && incident.affected_ips.toLowerCase().includes(searchLower))
    )
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'in_progress': return 'secondary'
      case 'resolved': return 'default'
      case 'closed': return 'outline'
      default: return 'default'
    }
  }

  const updateIncidentStatus = async (incidentId: number, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      await incidentsApi.updateIncident(incidentId, { status: newStatus })
      fetchIncidents(true) // Refresh the list
    } catch (error) {
      console.error('Failed to update incident status:', error)
    }
  }

  // Intersection Observer for infinite scrolling
  const lastIncidentRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore || !hasMore) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        console.log('Loading more incidents...')
        fetchIncidents(false) // Don't reset, just load more
      }
    }, {
      rootMargin: '100px', // Trigger 100px before the element is visible
      threshold: 0.1
    })
    
    if (node) observerRef.current.observe(node)
  }, [loadingMore, hasMore, fetchIncidents])

  return (
    <div className="space-y-4">
      {/* Incidents Table with integrated filters */}
             <Card className="shadow-sm rounded-xl h-full flex flex-col max-h-[calc(100vh-0px)]">
        <CardHeader className="pb-4 px-6 flex-shrink-0">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Security Incidents
            </CardTitle>
            <Button variant="outline" size="sm" className="h-9 px-4">
              <AlertTriangle className="mr-2 h-4 w-4" />
              New Incident
            </Button>
          </div>
          
          {/* Filters Section - All in one row */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-32 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-9 w-32 text-sm">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Total Incidents Counter */}
            <div className="flex items-center h-9 px-3 bg-muted/30 rounded-md border border-muted-foreground/20">
              <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                {totalIncidents.toLocaleString()} incidents
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-0 px-2 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading incidents...</div>
            </div>
          ) : (
            <div className="overflow-auto h-full max-h-[calc(100vh-215px)] custom-scrollbar" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
            }}>
              <div className="overflow-x-auto">
                <Table className="min-w-[800px] sm:min-w-0">
                                     <TableHeader className="sticky top-0 bg-background z-10">
                     <TableRow>
                       <TableHead className="text-xs whitespace-nowrap py-2 px-2">Status</TableHead>
                       <TableHead className="text-xs whitespace-nowrap py-2 px-2">Title</TableHead>
                       <TableHead className="text-xs whitespace-nowrap py-2 px-2">Severity</TableHead>
                       <TableHead className="text-xs whitespace-nowrap py-2 px-2">Affected IPs</TableHead>
                       <TableHead className="text-xs whitespace-nowrap py-2 px-2">Blocked</TableHead>
                       <TableHead className="text-xs whitespace-nowrap py-2 px-2">Created</TableHead>
                     </TableRow>
                   </TableHeader>
                                     <TableBody>
                     {filteredIncidents.map((incident, index) => (
                       <TableRow 
                         key={incident.id}
                         className="cursor-pointer hover:bg-muted/50 transition-colors"
                         onClick={() => setSelectedIncident(incident)}
                       >
                         <TableCell className="py-2 px-2">
                           <div className="flex items-center gap-2">
                             {getStatusIcon(incident.status)}
                             <Badge variant={getStatusColor(incident.status) as any} className="text-xs">
                               {incident.status.replace('_', ' ')}
                             </Badge>
                           </div>
                         </TableCell>
                         <TableCell className="py-2 px-2">
                           <div>
                             <div className="font-medium text-sm">{incident.title}</div>
                             <div className="text-xs text-muted-foreground line-clamp-1">
                               {incident.description}
                             </div>
                           </div>
                         </TableCell>
                         <TableCell className="py-2 px-2">
                           <Badge variant={getSeverityColor(incident.severity) as any} className="text-xs">
                             {incident.severity}
                           </Badge>
                         </TableCell>
                         <TableCell className="font-mono text-xs whitespace-nowrap py-2 px-2">
                           {incident.affected_ips || 'N/A'}
                         </TableCell>
                         <TableCell className="py-2 px-2">
                           <div className="flex items-center gap-2">
                             {incident.is_blocked ? (
                               <Badge variant="destructive" className="text-xs">Blocked</Badge>
                             ) : (
                               <Badge variant="secondary" className="text-xs">Active</Badge>
                             )}
                             {incident.is_quarantined && (
                               <Badge variant="outline" className="text-xs">Quarantined</Badge>
                             )}
                           </div>
                         </TableCell>
                         <TableCell className="text-xs whitespace-nowrap py-2 px-2">
                           {format(new Date(incident.created_at), 'MMM dd, HH:mm')}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                </Table>
                
                {/* Loading indicator for infinite scroll */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    <div className="text-muted-foreground text-sm font-medium">Loading more incidents...</div>
                  </div>
                )}
                
                {/* End of data indicator */}
                {!hasMore && filteredIncidents.length > 0 && (
                  <div className="flex items-center justify-center py-6">
                    <div className="text-muted-foreground text-sm font-medium">No more incidents to load</div>
                  </div>
                )}
                
                {/* Empty state */}
                {!loading && filteredIncidents.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-muted-foreground text-sm font-medium mb-2">No incidents found</div>
                      <div className="text-muted-foreground text-xs">Try adjusting your filters or search terms</div>
                    </div>
                  </div>
                )}
                
                                 {/* Intersection observer trigger element */}
                 {hasMore && !loadingMore && (
                   <div 
                     ref={lastIncidentRef}
                     className="h-4 w-full"
                     style={{ marginTop: '20px' }}
                   />
                 )}
               </div>
             </div>
           )}
         </CardContent>
       </Card>

       {/* Enhanced Incident Details Dialog */}
       <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
         <DialogContent className="max-w-3xl">
           {selectedIncident && (
             <>
               <DialogHeader>
                 <DialogTitle className="flex items-center gap-3">
                   <AlertTriangle className="h-5 w-5 text-destructive" />
                   {selectedIncident.title}
                 </DialogTitle>
               </DialogHeader>
               
               <div className="space-y-6">
                 {/* Incident Details */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                     <div>
                       <h4 className="font-medium mb-2">Description</h4>
                       <p className="text-sm text-muted-foreground">
                         {selectedIncident.description}
                       </p>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <h4 className="font-medium mb-2">Status</h4>
                         <Select
                           value={selectedIncident.status}
                           onValueChange={(value) => 
                             updateIncidentStatus(selectedIncident.id!, value as 'open' | 'in_progress' | 'resolved' | 'closed')
                           }
                         >
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="open">Open</SelectItem>
                             <SelectItem value="in_progress">In Progress</SelectItem>
                             <SelectItem value="resolved">Resolved</SelectItem>
                             <SelectItem value="closed">Closed</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       <div>
                         <h4 className="font-medium mb-2">Severity</h4>
                         <Badge variant={getSeverityColor(selectedIncident.severity) as any}>
                           {selectedIncident.severity}
                         </Badge>
                       </div>
                     </div>
                     
                     <div>
                       <h4 className="font-medium mb-2">Affected IP</h4>
                       <p className="font-mono text-sm text-muted-foreground">
                         {selectedIncident.affected_ips || 'N/A'}
                       </p>
                     </div>
                   </div>
                   
                   <div className="space-y-4">
                     <div>
                       <h4 className="font-medium mb-2">Current Status</h4>
                       <div className="flex flex-wrap gap-2">
                         {selectedIncident.is_blocked ? (
                           <Badge variant="destructive">Blocked</Badge>
                         ) : (
                           <Badge variant="secondary">Active</Badge>
                         )}
                         {selectedIncident.is_quarantined && (
                           <Badge variant="outline">Quarantined</Badge>
                         )}
                       </div>
                     </div>
                     
                     {selectedIncident.attack_vector && (
                       <div>
                         <h4 className="font-medium mb-2">Attack Vector</h4>
                         <p className="text-sm text-muted-foreground">
                           {selectedIncident.attack_vector}
                         </p>
                       </div>
                     )}
                     
                     {selectedIncident.recommended_actions && (
                       <div>
                         <h4 className="font-medium mb-2">Recommended Actions</h4>
                         <p className="text-sm text-muted-foreground">
                           {selectedIncident.recommended_actions}
                         </p>
                       </div>
                     )}
                     
                     <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                       <div>
                         <span className="font-medium">Created:</span><br />
                         {format(new Date(selectedIncident.created_at), 'MMM dd, yyyy HH:mm')}
                       </div>
                       <div>
                         <span className="font-medium">Updated:</span><br />
                         {format(new Date(selectedIncident.updated_at), 'MMM dd, yyyy HH:mm')}
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* Action Buttons */}
                 <div className="border-t pt-4">
                   <h4 className="font-medium mb-3">Security Actions</h4>
                   <div className="flex flex-wrap gap-2">
                     {!selectedIncident.is_blocked ? (
                       <Button 
                         variant="destructive" 
                         size="sm"
                         onClick={() => {
                           console.log(`Blocking incident ${selectedIncident.id}`)
                           // TODO: Implement block action
                         }}
                       >
                         <AlertTriangle className="mr-2 h-4 w-4" />
                         Block IP
                       </Button>
                     ) : (
                       <Button 
                         variant="default" 
                         size="sm"
                         onClick={() => {
                           console.log(`Unblocking incident ${selectedIncident.id}`)
                           // TODO: Implement unblock action
                         }}
                       >
                         <CheckCircle className="mr-2 h-4 w-4" />
                         Unblock IP
                       </Button>
                     )}
                     
                     {!selectedIncident.is_quarantined ? (
                       <Button 
                         variant="secondary" 
                         size="sm"
                         onClick={() => {
                           console.log(`Quarantining incident ${selectedIncident.id}`)
                           // TODO: Implement quarantine action
                         }}
                       >
                         <AlertTriangle className="mr-2 h-4 w-4" />
                         Quarantine
                       </Button>
                     ) : (
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => {
                           console.log(`Removing quarantine for incident ${selectedIncident.id}`)
                           // TODO: Implement remove quarantine action
                         }}
                       >
                         <CheckCircle className="mr-2 h-4 w-4" />
                         Remove Quarantine
                       </Button>
                     )}
                     
                     <Button 
                       variant="destructive" 
                       size="sm"
                       onClick={() => {
                         console.log(`Terminating incident ${selectedIncident.id}`)
                         // TODO: Implement terminate action
                       }}
                     >
                       <XCircle className="mr-2 h-4 w-4" />
                       Terminate Process
                     </Button>
                     
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => {
                         console.log(`Investigating incident ${selectedIncident.id}`)
                         // TODO: Implement investigate action
                       }}
                     >
                       <Search className="mr-2 h-4 w-4" />
                       Investigate
                     </Button>
                   </div>
                 </div>
               </div>
             </>
           )}
         </DialogContent>
       </Dialog>
     </div>
   )
 } 