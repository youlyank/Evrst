import { createServer } from 'http'
import { initializeRealtimeServer } from '@/lib/realtime-server'

// Initialize HTTP server for Socket.IO
const server = createServer()

// Initialize the real-time server
const realtimeServer = initializeRealtimeServer(server)

// Start the server
const PORT = process.env.SOCKET_PORT || 3001
server.listen(PORT, () => {
  console.log(`🔌 Real-time server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔌 Shutting down real-time server...')
  server.close(() => {
    console.log('✅ Real-time server stopped')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🔌 Shutting down real-time server...')
  server.close(() => {
    console.log('✅ Real-time server stopped')
    process.exit(0)
  })
})