import { ImageResponse } from 'next/og';
import {
  findIndicador,
  INDICADOR_SLUGS,
  type IndicadorColor,
} from '@/lib/diagnostico/indicadores';

export const runtime = 'edge';
export const alt = 'Diagnóstico Tamandaré — indicador comparativo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Pré-gera as imagens dos 5 indicadores no build.
export function generateImageMetadata() {
  return INDICADOR_SLUGS.map((slug) => ({
    id: slug,
    alt: `Indicador ${slug} de Tamandaré`,
    size,
    contentType,
  }));
}

const COLOR_MAP: Record<IndicadorColor, { accent: string; glow: string }> = {
  red: { accent: '#f87171', glow: '#7f1d1d' },
  amber: { accent: '#fbbf24', glow: '#78350f' },
  green: { accent: '#34d399', glow: '#064e3b' },
  blue: { accent: '#38bdf8', glow: '#0c4a6e' },
};

export default async function Image({ params }: { params: { indicador: string } }) {
  const ind = findIndicador(params.indicador);
  if (!ind) {
    return new ImageResponse(<div>Não encontrado</div>, { ...size });
  }
  const colors = COLOR_MAP[ind.color];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: '64px',
          background: `linear-gradient(135deg, #0A0A0B 0%, ${colors.glow}40 60%, #0A0A0B 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Left: text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            paddingRight: 40,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span
              style={{
                fontSize: 20,
                color: colors.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
              }}
            >
              Diagnóstico · {ind.short_title}
            </span>
            <h1
              style={{
                fontSize: 60,
                fontWeight: 700,
                color: '#fafafa',
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              {ind.title}
            </h1>
            <p style={{ fontSize: 26, color: '#a1a1aa', margin: 0, lineHeight: 1.3 }}>
              {ind.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontSize: 26,
                color: '#d4d4d8',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {ind.ranking_label}
            </span>
            <span style={{ fontSize: 18, color: '#71717a' }}>
              tamandareparticipa · doutor gigabyte
            </span>
          </div>
        </div>

        {/* Right: big number */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            minWidth: 380,
          }}
        >
          <div
            style={{
              fontSize: 220,
              fontFamily: 'monospace',
              fontWeight: 800,
              color: colors.accent,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              textShadow: `0 0 40px ${colors.accent}33`,
            }}
          >
            {ind.big_number}
          </div>
          {ind.big_number_unit && (
            <div style={{ fontSize: 20, color: '#71717a', marginTop: 8 }}>
              {ind.big_number_unit}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
