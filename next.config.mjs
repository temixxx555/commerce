/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
        pathname: '**',
      },
    ],
  },
  experimental: {
    serverActions: true, // optional if you're using server actions
  },
  output: 'standalone', // allows for dynamic rendering when deployed to Vercel
  reactStrictMode: true,
};

export default nextConfig;
