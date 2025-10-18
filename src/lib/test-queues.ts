import { feedQueue, notificationQueue } from '@/lib/queues'

// Simple test to verify queues are working
async function testQueues() {
  try {
    console.log('Testing BullMQ queues...')
    
    // Add a test job to feed queue
    await feedQueue.add('TEST_JOB', {
      type: 'UPDATE_USER_FEED',
      data: { userId: 'test-user', options: {} }
    })
    
    console.log('✅ Feed queue test job added successfully')
    
    // Add a test job to notification queue
    await notificationQueue.add('TEST_JOB', {
      type: 'SEND_NOTIFICATION',
      data: { userId: 'test-user', notification: { title: 'Test', message: 'Test notification' } }
    })
    
    console.log('✅ Notification queue test job added successfully')
    
    // Get queue counts
    const feedWaiting = await feedQueue.getWaiting()
    const notificationWaiting = await notificationQueue.getWaiting()
    
    console.log(`📊 Feed queue waiting jobs: ${feedWaiting.length}`)
    console.log(`📊 Notification queue waiting jobs: ${notificationWaiting.length}`)
    
    console.log('✅ Queue test completed successfully!')
    
  } catch (error) {
    console.error('❌ Queue test failed:', error)
  }
}

export default testQueues