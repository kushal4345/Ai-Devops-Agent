const { Worker } = require('bullmq');
const { redisConnection } = require('./emailQueue');
const { sendWelcomeEmail } = require('../services/emailService');

// Create a worker that listens to the 'EmailQueue'
const emailWorker = new Worker('EmailQueue', async (job) => {
  console.log(`[Worker] Picked up job ${job.id}: send-welcome-email`);
  
  if (job.name === 'send-welcome-email') {
    const { email, username } = job.data;
    
    // Call the actual email sending logic
    const result = await sendWelcomeEmail(email, username);
    
    if (!result.success) {
      throw new Error(`Failed to send email: ${result.error}`);
    }
    
    return result.data;
  }
}, { 
  connection: redisConnection 
});

// Optional: listen to events
emailWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed successfully!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} has failed: ${err.message}`);
});

module.exports = { emailWorker };
