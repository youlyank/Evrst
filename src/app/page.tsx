'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rocket, Globe, Users, MessageSquare, Radio, BarChart3, Shield, Activity } from 'lucide-react'

export default function ELKZone() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Rocket className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium">Loading ELK.Zone 2.0...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <div className="mr-6 flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-blue-600" />
                <span className="hidden font-bold sm:inline-block text-xl">ELK.Zone 2.0</span>
                <Badge variant="secondary" className="text-xs">Federated</Badge>
              </div>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Button variant="ghost" size="sm" className="h-8">
                Home
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                Communities
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                Live
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                Messages
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                Fediverse
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to ELK.Zone 2.0</h1>
          <p className="text-xl text-muted-foreground mb-8">
            The next-generation federated social platform with AI-powered intelligence
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Federated Network
              </CardTitle>
              <CardDescription>
                Connect with users across multiple federated platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ActivityPub, Matrix, PeerTube, and Jitsi integration for seamless cross-platform communication.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Smart Communities
              </CardTitle>
              <CardDescription>
                AI-powered community management and content moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intelligent content organization and automated moderation with human oversight.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Real-time Chat
              </CardTitle>
              <CardDescription>
                Instant messaging with end-to-end encryption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure messaging with Matrix protocol integration and self-destructing messages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-600" />
                Live Streaming
              </CardTitle>
              <CardDescription>
                Broadcast to the federated network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                PeerTube integration for decentralized video streaming and live broadcasts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Privacy First
              </CardTitle>
              <CardDescription>
                Your data, your rules, your control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                End-to-end encryption, zero-knowledge architecture, and GDPR compliance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-600" />
                Self-Healing
              </CardTitle>
              <CardDescription>
                AI-powered system monitoring and auto-recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intelligent monitoring with predictive failure detection and automatic recovery.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Real-time federation network status and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-muted-foreground">Network Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-muted-foreground">Active Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}