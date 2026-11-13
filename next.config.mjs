/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Lista blanca explícita (mismo criterio que Crack): con `hostname: '**'`
    // /_next/image queda como proxy abierto y cualquiera quema la cuota.
    remotePatterns: [
      // Imágenes de producto subidas desde el admin (mismo servicio de carga que Crack/Delta).
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Imágenes de los mocks de cartas. Se puede borrar cuando se conecte el backend.
      { protocol: 'https', hostname: 'images.pokemontcg.io' },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },

  async redirects() {
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
    return [
      { source: '/admin', destination: `${backendUrl}/admin/`, permanent: false },
    ];
  },
};

export default nextConfig;
