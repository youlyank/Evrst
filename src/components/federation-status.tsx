'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Globe, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Users,
  MessageSquare,
  Video,
  Phone,
  Activity,
  ExternalLink,
  Shield,
  BarChart3
} from 'lucide-react'

interface FederationServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  reachable: boolean;
  lastCheck: string;
  details?: any;
  error?: string;
}

interface FederationStatusResponse {
  overall: 'healthy' | 'degraded' | 'offline';
  lastUpdate: string;
  services: {
    akkoma: FederationServiceStatus;
    matrix: FederationServiceStatus;
    peertube: FederationServiceStatus;
    jitsi: FederationServiceStatus;
  };
  metrics: {
    totalPeers: number;
    activeConnections: number;
    messagesExchanged: number;
    uptime: number;
  };
  domain: string;
  version: string;
}

export function FederationStatus() {
  const [federationData, setFederationData] = useState<FederationStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFederationStatus = async () => {
    try {
      const response = await fetch('/api/federation/status')
      if (response.ok) {
        const data = await response.json()
        setFederationData(data)
        setError(null)
      } else {
        setError('Failed to fetch federation status')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFederationStatus()
    const interval = setInterval(fetchFederationStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      online: 'default' as const,
      degraded: 'secondary' as const,
      offline: 'destructive' as const
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'destructive'}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'Akkoma (ActivityPub)':
        return <Globe className="h-5 w-5 text-blue-500" />
      case 'Matrix (Synapse)':
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case 'PeerTube':
        return <Video className="h-5 w-5 text-red-500" />
      case 'Jitsi':
        return <Phone className="h-5 w-5 text-purple-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Fediverse Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading federation status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Fediverse Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <span className="ml-2">{error}</span>
            <Button variant="outline" size="sm" className="ml-4" onClick={fetchFederationStatus}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!federationData) return null

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Fediverse Status
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(federationData.overall)}
              {getStatusBadge(federationData.overall)}
              <Button variant="outline" size="sm" onClick={fetchFederationStatus}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Domain: {federationData.domain} | Version: {federationData.version} | 
            Last updated: {new Date(federationData.lastUpdate).toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Service Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(federationData.services).map(([key, service]) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getServiceIcon(service.name)}
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  {getStatusBadge(service.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Reachable:</span>
                <span className={service.reachable ? 'text-green-600' : 'text-red-600'}>
                  {service.reachable ? 'Yes' : 'No'}
                </span>
              </div>
              
              {service.details?.keys && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Keys:</p>
                  <div className="flex gap-2">
                    {Object.entries(service.details.keys).map(([keyName, valid]) => (
                      <Badge 
                        key={keyName} 
                        variant={valid ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {keyName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {service.details?.wellKnown && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Well-known files:</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(service.details.wellKnown).map(([fileName, exists]) => (
                      <Badge 
                        key={fileName} 
                        variant={exists ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {fileName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {service.details?.service?.url && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Service URL:</span>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={service.details.service.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Check
                    </a>
                  </Button>
                </div>
              )}

              {service.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Error: {service.error}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Federation Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {federationData.metrics.totalPeers}
              </div>
              <div className="text-sm text-muted-foreground">Total Peers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {federationData.metrics.activeConnections}
              </div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {federationData.metrics.messagesExchanged}
              </div>
              <div className="text-sm text-muted-foreground">Messages Exchanged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor(federationData.metrics.uptime / 3600)}h
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Federation Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Federation Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <Globe className="mr-2 h-4 w-4" />
              Cross-Server Post
            </Button>
            <Button variant="outline" className="justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Join via Matrix
            </Button>
            <Button variant="outline" className="justify-start">
              <Video className="mr-2 h-4 w-4" />
              Stream Live
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Find Federated Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}