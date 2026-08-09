const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const { verifyToken } = require('../middlewares/authMiddleware');

// All GitHub routes require the user to be authenticated
router.use(verifyToken);

router.get('/repos', githubController.getRepositories);
router.get('/repos/:owner/:repoName/branches', githubController.getBranches);

module.exports = router;
