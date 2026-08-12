import { apiClient } from './client';

/**
 * Create a new job (Starts Analysis)
 * @param {Object} repoData - The full repository data from GitHub API
 * @param {string} branch - The branch to analyze
 */
export const createJob = async (repoData, branch) => {
  const payload = {
    githubRepoId: repoData.id,
    name: repoData.name,
    fullName: repoData.fullName,
    defaultBranch: repoData.defaultBranch,
    isPrivate: repoData.private,
    htmlUrl: repoData.url,
    branch: branch,
  };

  const response = await apiClient.post('/jobs', payload);
  return response.data;
};

/**
 * Get all jobs for the logged-in user
 */
export const getUserJobs = async () => {
  const response = await apiClient.get('/jobs');
  return response.data;
};

/**
 * Get live status of a single job
 * @param {string} jobId 
 */
export const getJobStatus = async (jobId) => {
  const response = await apiClient.get(`/jobs/${jobId}`);
  return response.data;
};
