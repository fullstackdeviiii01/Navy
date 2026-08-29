/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? true : false,
  },
  serverExternalPackages: [
    'pdfkit',
    'mongoose',
    '@ffmpeg-installer/ffmpeg',
    '@ffprobe-installer/ffprobe',
  ],
  async rewrites() {
    return [
      // Transparent rewrites to dynamic media streaming (works with all existing DB URLs)
      {
        source: "/products/images/:path*",
        destination: "/api/media/products/images/:path*",
      },
      {
        source: "/products/videos/:path*",
        destination: "/api/media/products/videos/:path*",
      },
      {
        source: "/categories/images/:path*",
        destination: "/api/media/categories/images/:path*",
      },
      {
        source: "/reviews/videos/:path*",
        destination: "/api/media/reviews/videos/:path*",
      },
      {
        source: "/reviews/:path*",
        destination: "/api/media/reviews/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "/api/media/uploads/:path*",
      },
      {
        source: "/company/:path*",
        destination: "/api/media/company/:path*",
      },
    ];
  },
};

export default nextConfig;
