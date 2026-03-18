import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://rwandadronecommunity.rw'

  const staticRoutes = [
    '',
    '/forum',
    '/projects',
    '/events',
    '/services',
    '/opportunities',
    '/resources',
    '/pilots',
    '/marketplace',
    '/news',
    '/safety',
    '/airspace',
    '/logbook',
    '/compliance',
    '/equipment',
    '/mentorship',
    '/login',
    '/register',
    '/get-started',
  ]

  return staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
