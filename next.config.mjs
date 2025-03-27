/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.redditstatic.com', 'styles.redditmedia.com', 'i.redd.it'],
  },
};

export default nextConfig;
