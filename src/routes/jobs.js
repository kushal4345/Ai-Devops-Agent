const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { userApiLimiter } = require('../middlewares/rateLimiter');

// All job routes require the user to be logged in
router.use(verifyToken);

// Apply our Redis user-based rate limiter to all job routes
router.use(userApiLimiter);

// POST /api/jobs        → Create a new job (User clicks "Start Analysis")
router.post('/', jobController.createJob);

// GET  /api/jobs        → Get all jobs for the logged-in user
router.get('/', jobController.getUserJobs);

// GET  /api/jobs/:jobId → Get the live status of a single job
router.get('/:jobId', jobController.getJobStatus);

module.exports = router;
