const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Connect to Redis — this is the shared broker for all job queues
const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null, // Required by BullMQ
    });

// The Job Queue — this is where "Start Analysis" jobs will be stored
const jobQueue = new Queue('JobQueue', {
  connection: redisConnection,
});

module.exports = { jobQueue, redisConnection };
