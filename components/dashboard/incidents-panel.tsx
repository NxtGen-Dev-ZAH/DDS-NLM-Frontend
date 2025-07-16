'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useRealtimeIncidents } from '@/lib/websocket'
import { incidentsApi, handleApiError } from '@/lib/api'
import { Incident } from '@/types'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

interface IncidentsPanelProps {
  className?: string
}

export function IncidentsPanel({ className }: IncidentsPanelProps) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'critical'>('all')
  
  const realtimeIncidents = useRealtimeIncidents()

  // Fetch initial incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true)
        const response = await incidentsApi.getIncidents({ limit: 20 })
        setIncidents(response.data)
        setError(null)
      } catch (err) {
        setError(handleApiError(err))
        console.error('Failed to fetch incidents:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()
  }, [])

  // Combine static and real-time incidents
  const allIncidents = [...realtimeIncidents, ...incidents]
  
  // Filter incidents
  const filteredIncidents = allIncidents.filter(incident => {
    if (filter === 'open') return incident.status === 'open'
    if (filter === 'critical') return incident.severity === 'critical'
    return true
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'in_progress': return 'secondary'
      case 'resolved': return 'default'
      case 'closed': return 'outline'
      default: return 'outline'
    }
  }

  const refreshIncidents = async () => {
    try {
      const response = await incidentsApi.getIncidents({ limit: 20 })
      setIncidents(response.data)
    } catch (err) {
      console.error('Failed to refresh incidents:', err)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Security Incidents</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="rounded-r-none"
              >
                All
              </Button>
              <Button
                variant={filter === 'open' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('open')}
                className="rounded-none"
              >
                Open
              </Button>
              <Button
                variant={filter === 'critical' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('critical')}
                className="rounded-l-none"
              >
                Critical
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={refreshIncidents}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading incidents...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Failed to load incidents: {error}</span>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredIncidents.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No incidents found
                </div>
              ) : (
                filteredIncidents.map((incident, index) => (
                  <div
                    key={incident.id || index}
                    className={cn(
                      "p-4 rounded-lg border transition-colors hover:bg-accent",
                      index < realtimeIncidents.length && "bg-blue-50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          <h3 className="font-medium text-sm">{incident.title}</h3>
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {incident.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Created {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                          </span>
                          {incident.affected_ips && (
                            <span>
                              Affected IPs: {incident.affected_ips}
                            </span>
                          )}
                          {incident.attack_vector && (
                            <span>
                              Vector: {incident.attack_vector}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusColor(incident.status)}>
                          {incident.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        
                        <div className="text-xs text-muted-foreground">
                          ID: {incident.id || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {incident.agent_analysis && (
                      <>
                        <Separator className="my-2" />
                        <div className="text-xs">
                          <span className="font-medium text-blue-600">AI Analysis: </span>
                          <span className="text-muted-foreground">
                            {incident.agent_analysis.substring(0, 150)}
                            {incident.agent_analysis.length > 150 && '...'}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {incident.recommended_actions && (
                      <div className="mt-2 text-xs">
                        <span className="font-medium text-green-600">Recommended Actions: </span>
                        <span className="text-muted-foreground">
                          {incident.recommended_actions.substring(0, 100)}
                          {incident.recommended_actions.length > 100 && '...'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Showing {filteredIncidents.length} incidents</span>
            {realtimeIncidents.length > 0 && (
              <span className="text-blue-600">
                {realtimeIncidents.length} new since page load
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Open: {allIncidents.filter(i => i.status === 'open').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>In Progress: {allIncidents.filter(i => i.status === 'in_progress').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Resolved: {allIncidents.filter(i => i.status === 'resolved').length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 