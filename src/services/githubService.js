const axios = require('axios');

const getAccessToken = async (code) => {
  const { data } = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (data.error) {
    throw new Error(data.error_description || 'Failed to get GitHub access token');
  }

  return data.access_token;
};

const getUserProfile = async (accessToken) => {
  const { data: profile } = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Fetch emails because the primary email might be hidden in the public profile
  const { data: emails } = await axios.get('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const primaryEmail = emails.find((email) => email.primary)?.email;

  return {
    githubId: profile.id.toString(),
    username: profile.login,
    email: primaryEmail,
    avatarUrl: profile.avatar_url,
  };
};

module.exports = {
  getAccessToken,
  getUserProfile,
};
