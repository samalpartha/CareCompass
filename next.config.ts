import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
    // Enable static HTML export for GitHub Pages
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  },
};

export default nextConfig;
