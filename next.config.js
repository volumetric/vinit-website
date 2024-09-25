/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['yaml'],
  },
  images: {
    domains: [
      'vinit-agrawal-website.s3.amazonaws.com',
      'replicate.delivery',
      'vinit-agrawal-website.s3.us-east-1.amazonaws.com'
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig