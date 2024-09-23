/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['yaml'],
  },
  images: {
    domains: ['vinit-agrawal-website.s3.amazonaws.com', 'replicate.delivery'],
  },
}

module.exports = nextConfig