import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/superadmin/',
        '/api/',
        '/debug-auth/',
        '/admin/sys-9x7k2m8n4p/',
      ],
    },
    sitemap: 'https://rwandadronecommunity.rw/sitemap.xml',
  }
}
