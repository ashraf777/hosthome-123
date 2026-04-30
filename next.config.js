/** @type {import('next').NextConfig} */

if (typeof global !== 'undefined') {
  const isLocalStorageBroken = !global.localStorage || typeof global.localStorage.getItem !== 'function';
  if (isLocalStorageBroken) {
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    };
  }
}

const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hosthomestaging.frenclub.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
