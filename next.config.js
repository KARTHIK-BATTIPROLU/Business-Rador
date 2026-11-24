/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Lead photos come from Google, Unsplash, Openverse and Instagram CDNs, so any https host is allowed.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
