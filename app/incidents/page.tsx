'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { incidentsApi } from '@/lib/api'
import { Incident } from '@/types'
import { format } from 'date-fns'

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 15

  useEffect(() => {
    fetchIncidents()
  }, [currentPage, statusFilter, severityFilter])

  const fetchIncidents = async () => {
    try {
      setLoading(true)
      const params: any = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (severityFilter !== 'all') {
        params.severity = severityFilter
      }

      const response = await incidentsApi.getIncidents(params)
      setIncidents(response.data)
      setTotalPages(Math.ceil(response.data.length / itemsPerPage))
    } catch (error) {
      console.error('Failed to fetch incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = searchTerm === '' || 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.affected_ips && incident.affected_ips.includes(searchTerm))
    
    return matchesSearch
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
      fetchIncidents() // Refresh the list
    } catch (error) {
      console.error('Failed to update incident status:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Incidents</h1>
          <p className="text-muted-foreground">
            Monitor and manage detected security threats and anomalies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <AlertTriangle className="mr-2 h-4 w-4" />
            New Incident
          </Button>
        </div>
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
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
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
            <div className="text-sm text-muted-foreground flex items-center">
              Total: {incidents.length} incidents
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading incidents...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Affected IPs</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          <Badge variant={getStatusColor(incident.status) as any}>
                            {incident.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {incident.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(incident.severity) as any}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {incident.affected_ips || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(incident.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(incident.updated_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedIncident(incident)}
                              >
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{incident.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {incident.description}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Status</h4>
                                    <Select
                                      value={incident.status}
                                      onValueChange={(value) => 
                                        updateIncidentStatus(incident.id!, value as 'open' | 'in_progress' | 'resolved' | 'closed')
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
                                    <Badge variant={getSeverityColor(incident.severity) as any}>
                                      {incident.severity}
                                    </Badge>
                                  </div>
                                </div>
                                {incident.attack_vector && (
                                  <div>
                                    <h4 className="font-medium mb-2">Attack Vector</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {incident.attack_vector}
                                    </p>
                                  </div>
                                )}
                                {incident.recommended_actions && (
                                  <div>
                                    <h4 className="font-medium mb-2">Recommended Actions</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {incident.recommended_actions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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