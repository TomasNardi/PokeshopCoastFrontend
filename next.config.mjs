/**
 * Hosts de donde salen las imágenes de producto: el backend (en local sirve
 * /media/ desde disco) y el dominio público del bucket de R2 en producción
 * (NEXT_PUBLIC_MEDIA_URL, ej: https://media.pokeshopcoast.com).
 */
function imageHost(url, pathname) {
  try {
    const { protocol, hostname, port } = new URL(url);
    return { protocol: protocol.replace(':', ''), hostname, port, pathname };
  } catch {
    return null;
  }
}

const backendOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');
const mediaHosts = [imageHost(backendOrigin, '/media/**'), imageHost(process.env.NEXT_PUBLIC_MEDIA_URL, '/**')].filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Lista blanca explícita (mismo criterio que Crack): con `hostname: '**'`
    // /_next/image queda como proxy abierto y cualquiera quema la cuota.
    remotePatterns: [
      // Catálogo y fotos de producto: backend (local) y bucket público de R2.
      ...mediaHosts,
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
