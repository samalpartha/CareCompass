import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
<<<<<<< HEAD
    // Enable static HTML export for GitHub Pages
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
=======
  output: 'export',
  basePath: '/CareCompass',
>>>>>>> a66ac95 (can u make it deployable to github pages)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
<<<<<<< HEAD

=======
  images: {
    unoptimized: true,
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
    ],
  },
>>>>>>> a66ac95 (can u make it deployable to github pages)
};

export default nextConfig;
