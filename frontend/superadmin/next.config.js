const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async redirects() {
    return [
      {
        source: '/',
        destination: '/superadmin/dashboard',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/superadmin/dashboard',
        permanent: false,
      },
      {
        source: '/tenants',
        destination: '/superadmin/tenants',
        permanent: false,
      },
      {
        source: '/tenants/:id',
        destination: '/superadmin/tenants/:id',
        permanent: false,
      },
      {
        source: '/plans',
        destination: '/superadmin/plans',
        permanent: false,
      },
      {
        source: '/billing',
        destination: '/superadmin/billing',
        permanent: false,
      },
      {
        source: '/settings',
        destination: '/superadmin/settings',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/superadmin/login',
        permanent: false,
      },
      {
        source: '/profile',
        destination: '/superadmin/profile',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

module.exports = nextConfig;
