const axios = require('axios');
const prisma = require('../utils/prismaClient');

// Helper function to handle GitHub API requests and handle 401s
const fetchFromGitHub = async (url, token, res) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired. Log the user out immediately.
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'GitHub token expired or invalid. Please log in again.' });
    }
    throw error;
  }
};

const getRepositories = async (req, res) => {
  try {
    const { userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // 5 repos per page for infinite scroll

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ error: 'GitHub access token not found for this user.' });
    }

    // Sort by updated time, descending to show recent repos first
    let url = `https://api.github.com/user/repos?sort=updated&direction=desc&per_page=${perPage}&page=${page}`;

    const repos = await fetchFromGitHub(url, user.githubAccessToken, res);

    // If the helper function sent a response (like 401), don't send another one
    if (res.headersSent) return;

    // Filter by search term if provided
    const search = req.query.search;
    let filteredRepos = repos;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(lowerSearch) ||
        (repo.description && repo.description.toLowerCase().includes(lowerSearch))
      );
    }

    // Map to just the fields we care about for the frontend
    const sanitizedRepos = filteredRepos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      url: repo.html_url,
      language: repo.language,
      updatedAt: repo.updated_at,
      defaultBranch: repo.default_branch,
      owner: repo.owner.login
    }));

    res.json(sanitizedRepos);

  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories from GitHub.' });
  }
};

const getBranches = async (req, res) => {
  try {
    const { userId } = req.user;
    const { owner, repoName } = req.params;

    if (!owner || !repoName) {
      return res.status(400).json({ error: 'Owner and repository name are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ error: 'GitHub access token not found for this user.' });
    }

    const url = `https://api.github.com/repos/${owner}/${repoName}/branches?per_page=100`;

    const branches = await fetchFromGitHub(url, user.githubAccessToken, res);

    if (res.headersSent) return;

    const sanitizedBranches = branches.map(branch => ({
      name: branch.name,
      commitSha: branch.commit.sha
    }));

    res.json(sanitizedBranches);

  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches from GitHub.' });
  }
};

module.exports = {
  getRepositories,
  getBranches
};
