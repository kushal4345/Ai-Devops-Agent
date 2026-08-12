const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Connect to Redis for BullMQ
const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

// Create the email queue
const emailQueue = new Queue('EmailQueue', { 
  connection: redisConnection 
});

module.exports = { 
  emailQueue,
  redisConnection
};
