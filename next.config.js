/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output standalone — usado pelo Dockerfile multi-stage pra produzir imagem
  // ~150MB sem node_modules. Coolify e qualquer host Docker se beneficia.
  output: 'standalone',
  images: {
    remotePatterns: [
      // Google Street View Static API (thumbnails do ponto da contribuição)
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/maps/api/streetview/**',
      },
      // Google Static Maps API (og:image, previews de relatório)
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/maps/api/staticmap/**',
      },
      // Supabase Storage (uploads de fotos/áudios das contribuições)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    // Necessário pro @google-cloud/speech e outras libs Node-only
    serverComponentsExternalPackages: [
      '@google-cloud/speech',
      '@google-cloud/vision',
      '@google/earthengine',
    ],
  },
};

module.exports = nextConfig;
