import type { MetadataRoute } from 'next';
import { INDICADOR_SLUGS } from '@/lib/diagnostico/indicadores';
import { MACROAREA_SLUGS } from '@/lib/zoneamento/macroareas';

/**
 * Sitemap dinâmico (Next 13+ convention).
 * Reflete as 9 rotas top-level + as 5 sub-rotas de /diagnostico + as 10 de /zoneamento.
 * Excluído: /admin (acesso restrito) e /api/*.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/contribuir`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/diagnostico`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/zoneamento`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/chat`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/resultados`, lastModified: now, changeFrequency: 'hourly', priority: 0.7 },
    { url: `${base}/audiencia`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/sobre`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const indicadorRoutes: MetadataRoute.Sitemap = INDICADOR_SLUGS.map((slug) => ({
    url: `${base}/diagnostico/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const macroareaRoutes: MetadataRoute.Sitemap = MACROAREA_SLUGS.map((slug) => ({
    url: `${base}/zoneamento/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...indicadorRoutes, ...macroareaRoutes];
}
