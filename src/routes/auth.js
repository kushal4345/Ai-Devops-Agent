const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

// GitHub OAuth Endpoints
router.get('/github', authLimiter, authController.githubLogin);
router.get('/github/callback', authLimiter, authController.githubCallback);

// Token Management
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
