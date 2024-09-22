/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['vinit-agrawal-website.s3.amazonaws.com'],
  },
}

module.exports = nextConfig