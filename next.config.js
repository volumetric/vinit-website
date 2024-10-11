/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['yaml'],
  },
  images: {
    domains: [
      'vinit-agrawal-website.s3.amazonaws.com',
      'replicate.delivery',
      'vinit-agrawal-website.s3.us-east-1.amazonaws.com',
      'i.kym-cdn.com',
      'i.ytimg.com',
      'i.imgur.com',
      '*.media.tumblr.com',
      'a.kym-cdn.com',
      'pbs.twimg.com'
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig