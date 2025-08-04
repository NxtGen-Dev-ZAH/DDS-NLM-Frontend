'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AlertTriangle, 
  Shield, 
  ShieldX, 
  ShieldCheck,
  Clock,
  MapPin,
  Activity,
  FileText,
  X,
  Zap,
  Target,
  Network,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface DetailPopupProps {
  isOpen: boolean
  onClose: () => void
  data: any
  type: 'attack' | 'incident'
}

export function DetailPopup({ isOpen, onClose, data, type }: DetailPopupProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`${action} action for ${type}:`, data.id)
      // Here you would make actual API calls
    } catch (error) {
      console.error(`Failed to ${action}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionButtons = () => {
    const baseButtons = [
      {
        label: 'Terminate Attack',
        icon: ShieldX,
        variant: 'destructive' as const,
        action: 'terminate',
        description: 'Immediately stop the attack'
      },
      {
        label: 'Quarantine Source',
        icon: Shield,
        variant: 'secondary' as const,
        action: 'quarantine',
        description: 'Isolate the source IP'
      },
      {
        label: 'Unblock IP',
        icon: ShieldCheck,
        variant: 'default' as const,
        action: 'unblock',
        description: 'Remove from blocklist'
      }
    ]

    return baseButtons
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'bg-red-500 text-white'
    if (score >= 70) return 'bg-orange-500 text-white'
    if (score >= 50) return 'bg-yellow-500 text-black'
    return 'bg-green-500 text-white'
  }

  const renderAttackDetails = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Attack Details</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(data.timestamp), 'MMM dd, yyyy HH:mm:ss')}
              </p>
            </div>
          </div>
          <Badge className={`px-3 py-1 ${getSeverityColor(data.severity)}`}>
            {data.severity.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Confidence Score</span>
            </div>
            <Badge className={`text-sm px-2 py-1 ${getConfidenceColor(data.confidence_score)}`}>
              {data.confidence_score}%
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Threat Type</span>
            </div>
            <Badge variant="destructive" className="text-sm">
              {data.threat_type}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Network Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="h-4 w-4 text-blue-500" />
            Network Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source IP</span>
              </div>
              <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md">{data.source_ip}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Destination IP</span>
              </div>
              <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md">{data.destination_ip}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Port</span>
            </div>
            <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md">{data.port}</p>
          </div>
        </CardContent>
      </Card>

      {/* ML Model Information */}
      {data.ml_model_used && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-purple-500" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Model Used</span>
                <Badge variant="outline" className="text-xs">{data.ml_model_used}</Badge>
              </div>
              {data.is_anomaly && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Anomaly Score</span>
                  <Badge variant="secondary" className="text-xs">{data.anomaly_score}%</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Log */}
      {data.raw_log && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-gray-500" />
              Raw Log Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 border rounded-lg p-3 max-h-40 overflow-y-auto max-w-full">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words overflow-x-auto">
                {data.raw_log}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderIncidentDetails = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{data.title}</h3>
              <p className="text-sm text-muted-foreground">{data.description}</p>
            </div>
          </div>
          <Badge variant={data.status === 'open' ? 'destructive' : 'default'}>
            {data.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Created</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(data.created_at), 'MMM dd, yyyy HH:mm:ss')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <Badge variant={data.status === 'open' ? 'destructive' : 'default'}>
              {data.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {data.affected_ips && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-orange-500" />
              Affected IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md">{data.affected_ips}</p>
          </CardContent>
        </Card>
      )}

      {data.agent_analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.agent_analysis}</p>
          </CardContent>
        </Card>
      )}

      {data.recommended_actions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-green-600" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.recommended_actions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {type === 'attack' ? (
              <>
                <AlertTriangle className="h-6 w-6 text-red-500" />
                Attack Details
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-blue-500" />
                Incident Details
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Details Section */}
          <div>
            {type === 'attack' ? renderAttackDetails() : renderIncidentDetails()}
          </div>

          <Separator />

          {/* Actions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Security Actions
            </h3>
            <div className="grid grid-cols-1 gap-3 max-w-md">
              {getActionButtons().map((button) => (
                <Button
                  key={button.action}
                  variant={button.variant}
                  onClick={() => handleAction(button.action)}
                  disabled={isLoading}
                  className="justify-start h-auto py-3 px-3 w-full"
                >
                  <button.icon className="h-4 w-4 mr-2" />
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-sm">{button.label}</span>
                    <span className="text-xs opacity-80 mt-1">{button.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 