import { apiClient } from './client';

/**
 * Fetch a page of repositories for the authenticated user.
 * Supports pagination and optional search query.
 */
export const getRepositories = async ({ page = 1, search = '' }) => {
  const params = new URLSearchParams({ page });
  if (search) params.append('search', search);
  const res = await apiClient.get(`/github/repos?${params.toString()}`);
  return res.data;
};

/**
 * Fetch branches for a specific repository.
 */
export const getBranches = async (owner, repoName) => {
  const res = await apiClient.get(`/github/repos/${owner}/${repoName}/branches`);
  return res.data;
};
