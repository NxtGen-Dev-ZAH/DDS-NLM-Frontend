'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SearchResult } from '@/lib/search'
import { 
  AlertTriangle, 
  FileText, 
  Shield, 
  Clock, 
  MapPin, 
  ExternalLink,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  onResultClick: (result: SearchResult) => void
  onClose: () => void
}

export function SearchResults({ results, isLoading, onResultClick, onClose }: SearchResultsProps) {
  const router = useRouter()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="h-4 w-4" />
      case 'attack_log':
        return <Shield className="h-4 w-4" />
      case 'log':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500'
      case 'in_progress':
        return 'bg-yellow-500'
      case 'resolved':
        return 'bg-green-500'
      case 'closed':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result)
    router.push(result.url)
    onClose()
  }

  if (isLoading) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-2 z-[100] max-h-96 shadow-lg border bg-background/95 backdrop-blur-sm">
        <div className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
        </div>
      </Card>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 z-[100] max-h-96 shadow-lg border bg-background/95 backdrop-blur-sm">
      <ScrollArea className="max-h-80">
        <div className="p-2">
          {results.map((result) => (
            <Button
              key={result.id}
              variant="ghost"
              className="w-full justify-start p-3 h-auto text-left"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(result.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">
                      {result.title}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {result.severity && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getSeverityColor(result.severity)} text-white`}
                        >
                          {result.severity}
                        </Badge>
                      )}
                      {result.status && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(result.status)} text-white`}
                        >
                          {result.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {result.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {result.timestamp && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(result.timestamp), 'MMM dd, HH:mm')}</span>
                      </div>
                    )}
                    
                    {result.source_ip && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{result.source_ip}</span>
                      </div>
                    )}
                    
                    {result.threat_type && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>{result.threat_type}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t p-2">
        <div className="text-xs text-muted-foreground text-center">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </div>
      </div>
    </Card>
  )
} 