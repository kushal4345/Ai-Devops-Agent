const { PrismaClient } = require('@prisma/client');
const { jobQueue } = require('../workers/jobQueue');

const prisma = new PrismaClient();

// POST /api/jobs
// Called when the user selects a repository and clicks "Start Analysis"
const createJob = async (req, res) => {
  const { githubRepoId, name, fullName, defaultBranch, isPrivate, htmlUrl, branch } = req.body;
  const userId = req.user.id; // Comes from verifyToken middleware

  // --- Validation ---
  if (!githubRepoId || !name || !fullName || !branch) {
    return res.status(400).json({ error: 'Missing required repository details or branch.' });
  }

  try {
    // Step 1: Upsert the repository in PostgreSQL
    // If it exists (by githubRepoId), update it. If not, create it.
    const repository = await prisma.repository.upsert({
      where: { githubRepoId },
      update: {
        name,
        fullName,
        defaultBranch: defaultBranch || 'main',
        isPrivate: !!isPrivate,
        htmlUrl,
      },
      create: {
        userId,
        githubRepoId,
        name,
        fullName,
        defaultBranch: defaultBranch || 'main',
        isPrivate: !!isPrivate,
        htmlUrl,
      },
    });

    // Step 2: Create the Job record in PostgreSQL with status QUEUED
    // This is our permanent record. It lives in the database forever.
    const job = await prisma.job.create({
      data: {
        userId,
        repositoryId: repository.id,
        branch,
        status: 'QUEUED',
      },
    });

    console.log(`[JobController] Job ${job.id} created in PostgreSQL with status QUEUED`);

    // Step 3: Push the job into Redis via BullMQ
    // We only pass the IDs — the worker will look up full details from the DB.
    await jobQueue.add('process-repo-job', {
      jobId: job.id,
      repositoryId: repository.id,
      branch,
    });

    console.log(`[JobController] Job ${job.id} pushed to BullMQ (Redis)`);

    // Step 4: Respond immediately to the user with the jobId
    // The user doesn't wait for the analysis — it runs in the background!
    return res.status(201).json({
      message: 'Job created successfully! Analysis has started in the background.',
      jobId: job.id,
      status: job.status,
    });

  } catch (err) {
    console.error('[JobController] Error creating job:', err);
    return res.status(500).json({ error: 'Failed to create job.' });
  }
};

// GET /api/jobs/:jobId
// Called by the frontend to check the current status of a job
const getJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  try {
    const job = await prisma.job.findFirst({
      where: { id: jobId, userId }, // Only allow users to see their own jobs
      include: {
        repository: { select: { name: true, fullName: true } }, // Include repo name
        jobAttempts: true, // Include all fix attempts
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    return res.json(job);
  } catch (err) {
    console.error('[JobController] Error fetching job status:', err);
    return res.status(500).json({ error: 'Failed to fetch job status.' });
  }
};

// GET /api/jobs
// Get all jobs for the logged-in user
const getUserJobs = async (req, res) => {
  const userId = req.user.id;

  try {
    const jobs = await prisma.job.findMany({
      where: { userId },
      include: {
        repository: { select: { name: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' }, // Most recent jobs first
    });

    return res.json(jobs);
  } catch (err) {
    console.error('[JobController] Error fetching jobs:', err);
    return res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
};

module.exports = { createJob, getJobStatus, getUserJobs };
