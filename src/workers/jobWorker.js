const { Worker } = require('bullmq');
const { redisConnection } = require('./jobQueue');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// This worker listens to the 'JobQueue' in Redis.
// Every time a new job lands in the queue, this function runs.
const jobWorker = new Worker('JobQueue', async (job) => {
  const { jobId, repositoryId, branch } = job.data;

  console.log(`[JobWorker] Picked up job ${jobId} for repo ${repositoryId} on branch ${branch}`);

  try {
    // Step 1: Mark the job as CLONING in PostgreSQL
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'CLONING', startedAt: new Date() },
    });

    console.log(`[JobWorker] Job ${jobId} status → CLONING`);

    // -------------------------------------------------------
    // TODO: This is where your real work will go in the future
    //   1. Clone the repository using Git
    //   2. Run tests inside Docker
    //   3. If tests fail → call AI to fix the code
    //   4. Re-run tests
    //   5. Push the fix to GitHub
    // -------------------------------------------------------

    // For now, we simulate the pipeline with a placeholder
    console.log(`[JobWorker] Job ${jobId}: Pipeline placeholder — Docker/AI logic goes here.`);

    // Step 2: Mark the job as SUCCESS when done
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'SUCCESS', completedAt: new Date() },
    });

    console.log(`[JobWorker] Job ${jobId} completed successfully!`);

  } catch (err) {
    console.error(`[JobWorker] Job ${jobId} failed: ${err.message}`);

    // If anything crashes, mark the job as FAILED in PostgreSQL
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'FAILED', completedAt: new Date() },
    });

    throw err; // Re-throw so BullMQ knows the job failed and can retry
  }

}, { connection: redisConnection });

// Event Listeners
jobWorker.on('completed', (job) => {
  console.log(`[JobWorker] ✅ Job ${job.id} finished successfully!`);
});

jobWorker.on('failed', (job, err) => {
  console.error(`[JobWorker] ❌ Job ${job.id} failed: ${err.message}`);
});

module.exports = { jobWorker };
