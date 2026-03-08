/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'banknotescollection.com',
      },
    ],
  },
}

module.exports = nextConfig
