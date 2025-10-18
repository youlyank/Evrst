import { NextResponse } from "next/server";
import { db } from '@/lib/db';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    memory: 'healthy' | 'unhealthy';
    disk: 'healthy' | 'unhealthy';
  };
  metrics?: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    activeConnections: number;
    responseTime: number;
  };
}

export async function GET() {
  const startTime = Date.now();
  const startTimeHr = process.hrtime();
  
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '2.0.0',
    services: {
      database: 'unhealthy',
      redis: 'unhealthy',
      memory: 'healthy',
      disk: 'healthy'
    }
  };

  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    healthCheck.services.database = 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    healthCheck.status = 'unhealthy';
  }

  // Check Redis connection (if Redis is available)
  try {
    // This would be implemented if you have Redis client
    // await redis.ping();
    healthCheck.services.redis = 'healthy';
  } catch (error) {
    console.error('Redis health check failed:', error);
    // Redis failure doesn't make the whole service unhealthy
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const os = await import('os');
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = (usedMem / totalMem) * 100;

  if (memUsagePercent > 90) {
    healthCheck.services.memory = 'unhealthy';
    healthCheck.status = 'unhealthy';
  }

  // Check disk space (basic check)
  try {
    const fs = await import('fs');
    const stats = fs.statSync('.');
    // This is a simplified check - in production you'd want to check actual disk usage
    healthCheck.services.disk = 'healthy';
  } catch (error) {
    healthCheck.services.disk = 'unhealthy';
    healthCheck.status = 'unhealthy';
  }

  // Add detailed metrics if requested
  const url = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
  const includeMetrics = url.searchParams.get('detailed') === 'true';

  if (includeMetrics) {
    const endTimeHr = process.hrtime(startTimeHr);
    const responseTime = endTimeHr[0] * 1000 + endTimeHr[1] / 1e6;

    healthCheck.metrics = {
      memoryUsage: memUsage,
      cpuUsage: process.cpuUsage(),
      activeConnections: 0, // Would be implemented with actual connection tracking
      responseTime: Math.round(responseTime * 100) / 100
    };
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  return NextResponse.json(healthCheck, { status: statusCode });
}