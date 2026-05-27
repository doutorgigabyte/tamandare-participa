import { ImageResponse } from 'next/og';
import {
  findMacroarea,
  MACROAREA_SLUGS,
} from '@/lib/zoneamento/macroareas';

export const runtime = 'edge';
export const alt = 'Macroárea de Tamandaré';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateImageMetadata() {
  return MACROAREA_SLUGS.map((slug) => ({
    id: slug,
    alt: `Macroárea ${slug}`,
    size,
    contentType,
  }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const m = findMacroarea(params.slug);
  if (!m) {
    return new ImageResponse(<div>Não encontrada</div>, { ...size });
  }

  const cleanName = m.name.replace(/^(?:Macroárea|Zona Especial) (?:de |dos? |Centro )?/, '');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: `linear-gradient(135deg, #0A0A0B 0%, ${m.display_color}30 50%, #0A0A0B 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background: m.display_color,
              boxShadow: `0 0 30px ${m.display_color}99`,
            }}
          />
          <span
            style={{
              fontSize: 22,
              color: '#a1a1aa',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Macroárea · Plano Diretor Tamandaré
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span
            style={{
              fontSize: 22,
              color: m.display_color,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {m.name.startsWith('Macroárea') ? 'Macroárea' : ''}
          </span>
          <h1
            style={{
              fontSize: cleanName.length > 18 ? 88 : 120,
              fontWeight: 800,
              lineHeight: 1,
              margin: 0,
              letterSpacing: '-0.04em',
              color: m.display_color,
              maxWidth: 1000,
            }}
          >
            {cleanName}
          </h1>
          <p style={{ fontSize: 26, color: '#d4d4d8', margin: 0, lineHeight: 1.35, maxWidth: 900 }}>
            {m.description_plain.length > 180
              ? m.description_plain.slice(0, 180) + '…'
              : m.description_plain}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontSize: 24, color: '#71717a' }}>
            Contribua sobre esta macroárea até 31/05
          </span>
          <span style={{ fontSize: 18, color: '#52525b' }}>doutor gigabyte</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
