/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    'pdfkit',
    'mongoose',
    '@ffmpeg-installer/ffmpeg',
    '@ffprobe-installer/ffprobe',
  ],
};

export default nextConfig;
