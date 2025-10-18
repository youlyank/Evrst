import { NextResponse } from "next/server";
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // System metrics
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    
    // Database metrics
    let dbMetrics = { connections: 0, queryTime: 0 };
    try {
      const dbStart = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbMetrics.queryTime = Date.now() - dbStart;
      
      // Get connection count (PostgreSQL specific)
      const connResult = await db.$queryRaw`SELECT count(*) as count FROM pg_stat_activity`;
      dbMetrics.connections = Number(connResult[0]?.count || 0);
    } catch (error) {
      console.error('Database metrics failed:', error);
    }

    // Application metrics
    const os = await import('os');
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: uptime,
        memory: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external,
          arrayBuffers: memUsage.arrayBuffers
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        loadAverage: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem()
      },
      database: dbMetrics,
      application: {
        version: process.env.npm_package_version || '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        processId: process.pid
      }
    };

    // Prometheus metrics format
    const prometheusMetrics = [
      `# HELP elkzone_uptime_seconds Uptime of the application in seconds`,
      `# TYPE elkzone_uptime_seconds gauge`,
      `elkzone_uptime_seconds ${uptime}`,
      '',
      `# HELP elkzone_memory_bytes Memory usage in bytes`,
      `# TYPE elkzone_memory_bytes gauge`,
      `elkzone_memory_bytes{type="rss"} ${memUsage.rss}`,
      `elkzone_memory_bytes{type="heap_used"} ${memUsage.heapUsed}`,
      `elkzone_memory_bytes{type="heap_total"} ${memUsage.heapTotal}`,
      `elkzone_memory_bytes{type="external"} ${memUsage.external}`,
      '',
      `# HELP elkzone_database_connections Number of active database connections`,
      `# TYPE elkzone_database_connections gauge`,
      `elkzone_database_connections ${dbMetrics.connections}`,
      '',
      `# HELP elkzone_database_query_time_ms Database query response time in milliseconds`,
      `# TYPE elkzone_database_query_time_ms gauge`,
      `elkzone_database_query_time_ms ${dbMetrics.queryTime}`,
      '',
      `# HELP elkzone_cpu_usage_total CPU usage in microseconds`,
      `# TYPE elkzone_cpu_usage_total counter`,
      `elkzone_cpu_usage_total{type="user"} ${cpuUsage.user}`,
      `elkzone_cpu_usage_total{type="system"} ${cpuUsage.system}`,
      '',
      `# HELP elkzone_load_average System load average`,
      `# TYPE elkzone_load_average gauge`,
      `elkzone_load_average{period="1m"} ${os.loadavg()[0]}`,
      `elkzone_load_average{period="5m"} ${os.loadavg()[1]}`,
      `elkzone_load_average{period="15m"} ${os.loadavg()[2]}`,
    ].join('\n');

    // Return format based on Accept header
    const acceptHeader = request.headers.get('accept') || '';
    
    if (acceptHeader.includes('text/plain') || acceptHeader.includes('application/openmetrics-text')) {
      return new NextResponse(prometheusMetrics, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8'
        }
      });
    }

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Metrics collection failed:', error);
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    );
  }
}