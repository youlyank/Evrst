import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// Federation status interface
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

// Helper function to check if file exists and is readable
function checkKeyFile(filePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    return fs.existsSync(fullPath) && fs.accessSync(fullPath, fs.constants.R_OK) === undefined;
  } catch {
    return false;
  }
}

// Helper function to validate key file
function validateKeyFile(filePath: string, keyType: 'rsa' | 'ed25519' | 'ecdsa'): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return false;
    
    // For now, just check if file exists and has content
    const content = fs.readFileSync(fullPath, 'utf8');
    return content.length > 0;
  } catch {
    return false;
  }
}

// Helper function to make HTTP request to check service health
async function checkServiceHealth(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'ELKZone-Federation-Monitor/2.0'
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// Check Akkoma (ActivityPub) status
async function checkAkkomaStatus(): Promise<FederationServiceStatus> {
  const domain = process.env.FEDERATION_DOMAIN || 'elkzone.example.com';
  const status: FederationServiceStatus = {
    name: 'Akkoma (ActivityPub)',
    status: 'offline',
    reachable: false,
    lastCheck: new Date().toISOString()
  };

  try {
    // Check key files
    const privateKeyValid = validateKeyFile('federation/akkoma/keys/private.pem', 'rsa');
    const publicKeyValid = validateKeyFile('federation/akkoma/keys/public.pem', 'rsa');
    
    // Check well-known files
    const hostMetaExists = checkKeyFile('public/.well-known/host-meta');
    const webfingerExists = checkKeyFile('public/.well-known/webfinger.json');
    
    // Check service health (if configured)
    const serviceUrl = `https://${domain}/api/v1/instance`;
    const serviceReachable = await checkServiceHealth(serviceUrl);
    
    status.details = {
      keys: {
        private: privateKeyValid,
        public: publicKeyValid
      },
      wellKnown: {
        hostMeta: hostMetaExists,
        webfinger: webfingerExists
      },
      service: {
        reachable: serviceReachable,
        url: serviceUrl
      }
    };
    
    if (privateKeyValid && publicKeyValid && hostMetaExists && webfingerExists) {
      status.status = serviceReachable ? 'online' : 'degraded';
      status.reachable = serviceReachable;
    } else {
      status.status = 'offline';
      status.error = 'Missing or invalid configuration files';
    }
    
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return status;
}

// Check Matrix (Synapse) status
async function checkMatrixStatus(): Promise<FederationServiceStatus> {
  const domain = process.env.FEDERATION_DOMAIN || 'elkzone.example.com';
  const status: FederationServiceStatus = {
    name: 'Matrix (Synapse)',
    status: 'offline',
    reachable: false,
    lastCheck: new Date().toISOString()
  };

  try {
    // Check key files
    const ed25519KeyValid = validateKeyFile('federation/matrix/keys/ed25519.key', 'ed25519');
    const serverKeyValid = validateKeyFile('federation/matrix/keys/server.key', 'ed25519');
    
    // Check well-known files
    const serverConfigExists = checkKeyFile('public/.well-known/matrix/server');
    const clientConfigExists = checkKeyFile('public/.well-known/matrix/client');
    
    // Check service health
    const serverUrl = `https://matrix.${domain}/_matrix/server/versions`;
    const federationUrl = `https://matrix.${domain}/_matrix/federation/v1/version`;
    const serviceReachable = await checkServiceHealth(serverUrl);
    const federationReachable = await checkServiceHealth(federationUrl);
    
    status.details = {
      keys: {
        ed25519: ed25519KeyValid,
        server: serverKeyValid
      },
      wellKnown: {
        server: serverConfigExists,
        client: clientConfigExists
      },
      service: {
        reachable: serviceReachable,
        federationReachable: federationReachable,
        serverUrl: serverUrl,
        federationUrl: federationUrl
      }
    };
    
    if (ed25519KeyValid && serverKeyValid && serverConfigExists && clientConfigExists) {
      status.status = (serviceReachable && federationReachable) ? 'online' : 'degraded';
      status.reachable = serviceReachable && federationReachable;
    } else {
      status.status = 'offline';
      status.error = 'Missing or invalid configuration files';
    }
    
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return status;
}

// Check PeerTube status
async function checkPeerTubeStatus(): Promise<FederationServiceStatus> {
  const domain = process.env.FEDERATION_DOMAIN || 'elkzone.example.com';
  const status: FederationServiceStatus = {
    name: 'PeerTube',
    status: 'offline',
    reachable: false,
    lastCheck: new Date().toISOString()
  };

  try {
    // Check key files
    const privateKeyValid = validateKeyFile('federation/peertube/keys/private.pem', 'rsa');
    const publicKeyValid = validateKeyFile('federation/peertube/keys/public.pem', 'rsa');
    
    // Check service health
    const serviceUrl = `https://videos.${domain}/api/v1/config`;
    const nodeInfoUrl = `https://videos.${domain}/nodeinfo/2.0.json`;
    const serviceReachable = await checkServiceHealth(serviceUrl);
    const nodeInfoReachable = await checkServiceHealth(nodeInfoUrl);
    
    status.details = {
      keys: {
        private: privateKeyValid,
        public: publicKeyValid
      },
      service: {
        reachable: serviceReachable,
        nodeInfoReachable: nodeInfoReachable,
        serviceUrl: serviceUrl,
        nodeInfoUrl: nodeInfoUrl
      }
    };
    
    if (privateKeyValid && publicKeyValid) {
      status.status = serviceReachable ? 'online' : 'degraded';
      status.reachable = serviceReachable;
    } else {
      status.status = 'offline';
      status.error = 'Missing or invalid key files';
    }
    
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return status;
}

// Check Jitsi status
async function checkJitsiStatus(): Promise<FederationServiceStatus> {
  const domain = process.env.FEDERATION_DOMAIN || 'elkzone.example.com';
  const status: FederationServiceStatus = {
    name: 'Jitsi',
    status: 'offline',
    reachable: false,
    lastCheck: new Date().toISOString()
  };

  try {
    // Check key files
    const privateKeyValid = validateKeyFile('federation/jitsi/keys/private.pem', 'ecdsa');
    const publicKeyValid = validateKeyFile('federation/jitsi/keys/public.pem', 'ecdsa');
    
    // Check well-known files
    const configExists = checkKeyFile('public/.well-known/jitsi-config.json');
    
    // Check service health
    const meetUrl = `https://meet.${domain}/`;
    const serviceReachable = await checkServiceHealth(meetUrl);
    
    status.details = {
      keys: {
        private: privateKeyValid,
        public: publicKeyValid
      },
      wellKnown: {
        config: configExists
      },
      service: {
        reachable: serviceReachable,
        meetUrl: meetUrl
      }
    };
    
    if (privateKeyValid && publicKeyValid && configExists) {
      status.status = serviceReachable ? 'online' : 'degraded';
      status.reachable = serviceReachable;
    } else {
      status.status = 'offline';
      status.error = 'Missing or invalid configuration files';
    }
    
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return status;
}

// Get federation metrics
async function getFederationMetrics() {
  try {
    // Get user count
    const userCount = await db.user.count();
    
    // Get thread count
    const threadCount = await db.thread.count();
    
    // Get active users (last 30 days)
    const activeUsers = await db.user.count({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Get community count
    const communityCount = await db.community.count();
    
    return {
      totalPeers: communityCount,
      activeConnections: activeUsers,
      messagesExchanged: threadCount,
      uptime: process.uptime(),
      users: {
        total: userCount,
        active: activeUsers
      }
    };
  } catch (error) {
    console.error('Error getting federation metrics:', error);
    return {
      totalPeers: 0,
      activeConnections: 0,
      messagesExchanged: 0,
      uptime: process.uptime(),
      users: {
        total: 0,
        active: 0
      }
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const domain = process.env.FEDERATION_DOMAIN || 'elkzone.example.com';
    
    // Check all services
    const [akkoma, matrix, peertube, jitsi] = await Promise.all([
      checkAkkomaStatus(),
      checkMatrixStatus(),
      checkPeerTubeStatus(),
      checkJitsiStatus()
    ]);
    
    // Get metrics
    const metrics = await getFederationMetrics();
    
    // Determine overall status
    const services = [akkoma, matrix, peertube, jitsi];
    const onlineCount = services.filter(s => s.status === 'online').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    
    let overall: 'healthy' | 'degraded' | 'offline';
    if (onlineCount === services.length) {
      overall = 'healthy';
    } else if (onlineCount > 0 || degradedCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'offline';
    }
    
    const response: FederationStatusResponse = {
      overall,
      lastUpdate: new Date().toISOString(),
      services: {
        akkoma,
        matrix,
        peertube,
        jitsi
      },
      metrics,
      domain,
      version: '2.0.0'
    };
    
    // Add CORS headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    return NextResponse.json(response, { headers });
    
  } catch (error) {
    console.error('Federation status error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}