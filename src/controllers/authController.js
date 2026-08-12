const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');
const githubService = require('../services/githubService');
const emailService = require('../services/emailService');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

const githubLogin = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: "user:email"
  });

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?${params.toString()}`;

  console.log("\n========== GITHUB OAUTH ==========");
  console.log("CALLBACK FROM ENV:", process.env.GITHUB_CALLBACK_URL);
  console.log("FULL GITHUB URL:", githubAuthUrl);
  console.log("==================================\n");

  res.redirect(githubAuthUrl);
};

const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    // 1. Get Access Token from GitHub
    const githubAccessToken = await githubService.getAccessToken(code);

    // 2. Fetch User Profile from GitHub
    const profile = await githubService.getUserProfile(githubAccessToken);

    // 3. Find or Create User in PostgreSQL (Prisma)
    let user = await prisma.user.findUnique({
      where: { githubId: profile.githubId },
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          githubId: profile.githubId,
          username: profile.username,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          githubAccessToken: githubAccessToken,
        },
      });
    } else {
      // Update existing user with fresh GitHub token
      user = await prisma.user.update({
        where: { id: user.id },
        data: { githubAccessToken: githubAccessToken }
      });
    }

    // 4. Generate JWTs
    const { accessToken, refreshToken } = generateTokens(user.id);

    // 5. Save Refresh Token to Database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // 6. Send Welcome Email via Message Queue (if new user and they have an email)
    if (isNewUser && user.email) {
      await emailService.queueWelcomeEmail(user.email, user.username);
    }

    // 7. Set Refresh Token as HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Lax for typical OAuth redirects
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 8. Redirect to Frontend with Access Token (In a real app, send it safely to dashboard)
    // We append the access_token in the query string here just to get it to the frontend.
    // The frontend should extract it, remove it from the URL, and save it in memory.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?access_token=${accessToken}`);

  } catch (error) {
    console.error('GitHub Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    // Verify token math
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if token exists in database (hasn't been revoked/logged out)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Issue new Access Token
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh Error:', error);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Decode to get userId without throwing if expired
      const decoded = jwt.decode(refreshToken);
      if (decoded && decoded.userId) {
        // Clear refresh token from DB
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { refreshToken: null },
        });
      }
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

module.exports = {
  githubLogin,
  githubCallback,
  refresh,
  logout
};
