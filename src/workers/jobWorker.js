const { Worker } = require('bullmq');
const { redisConnection } = require('./jobQueue');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const simpleGit = require('simple-git');
const Docker = require('dockerode');

const prisma = new PrismaClient();
const docker = new Docker(); // Connects to local Docker Desktop by default

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

    // --- 1. Clone the repository using simple-git ---
    const baseDir = os.tmpdir();
    const repoPath = path.join(baseDir, 'autoops-jobs', `job-${jobId}`);
    
    // Create directory recursively
    await fs.mkdir(repoPath, { recursive: true });
    
    const git = simpleGit();
    
    // Fetch repository URL from DB (Assumes a Repository model with 'url' exists)
    const repo = await prisma.repository.findUnique({ where: { id: repositoryId } });
    const cloneUrl = repo ? repo.url : `https://github.com/placeholder-url.git`; // Fallback to avoid crashing

    console.log(`[JobWorker] Cloning ${cloneUrl} into ${repoPath}...`);
    // Uncomment when ready with real URLs:
    // await git.clone(cloneUrl, repoPath);

    // Step 2: Mark the job as RUNNING_TESTS
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'RUNNING_TESTS' },
    });
    console.log(`[JobWorker] Job ${jobId} status → RUNNING_TESTS`);

    // --- 2. Create and run Docker container ---
    console.log(`[JobWorker] Creating Docker container for job ${jobId}...`);
    const container = await docker.createContainer({
      Image: 'node:20-slim',
      Cmd: ['/bin/sh', '-c', 'npm install && npm test'],
      HostConfig: {
        Binds: [`${repoPath}:/app`]
      },
      WorkingDir: '/app'
    });

    await container.start();
    
    // Wait for the container to finish running the commands
    const result = await container.wait();
    
    // Fetch the raw logs
    const logBuffer = await container.logs({ stdout: true, stderr: true });
    const logs = logBuffer.toString('utf-8');
    
    console.log(`[JobWorker] Tests finished with exit code ${result.StatusCode}`);

    // If exit code is not 0, the tests failed.
    if (result.StatusCode !== 0) {
      throw new Error(`Tests failed. Logs: ${logs.substring(0, 500)}...`);
    }

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
