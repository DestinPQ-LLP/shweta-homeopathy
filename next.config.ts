import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    cpus: 2, // limit parallel static-page workers to avoid Google Sheets quota exhaustion
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drshwetahomoeopathy.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'docs.google.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  async redirects() {
    return [
      // Legacy slug → canonical slug (permanent 308 so old links / SEO still resolve)
      {
        source: '/conditions/female-diseases',
        destination: '/conditions/womens-health',
        permanent: true,
      },
      {
        source: '/conditions/skin-disease',
        destination: '/conditions/skin-diseases',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
