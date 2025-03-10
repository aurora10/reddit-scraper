/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    REDDIT_USERNAME: process.env.REDDIT_USERNAME,
    REDDIT_PASSWORD: process.env.REDDIT_PASSWORD,
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
