import { ImageResponse } from 'next/og';

/**
 * OG image root — usado quando a landing é compartilhada em
 * WhatsApp/Twitter/LinkedIn/Slack.
 *
 * Next 13+ convention: arquivo `opengraph-image.tsx` em qualquer pasta
 * gera automaticamente a meta tag og:image pra aquela rota.
 *
 * Especificação OG: 1200x630, png. Edge runtime.
 */

export const runtime = 'edge';
export const alt = 'Tamandaré Participa — 5 dias pra dizer o futuro da cidade';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'linear-gradient(135deg, #0A0A0B 0%, #0d2030 50%, #001a26 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#00D9FF',
              boxShadow: '0 0 24px #00D9FF',
            }}
          />
          <span
            style={{
              fontSize: 22,
              color: '#a1a1aa',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Plataforma cívica · Tamandaré/PE
          </span>
        </div>

        {/* Center: title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              fontSize: 108,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              margin: 0,
              backgroundImage: 'linear-gradient(135deg, #fafafa 0%, #a1a1aa 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Tamandaré Participa
          </h1>
          <p
            style={{
              fontSize: 36,
              color: '#d4d4d8',
              margin: 0,
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            O futuro da cidade deve ser planejado, decidido e validado com a sua
            gente.
          </p>
        </div>

        {/* Bottom: deadline + brand */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontSize: 18,
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              Prazo de contribuição
            </span>
            <span
              style={{
                fontSize: 32,
                color: '#FF6B35',
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              31/05/2026 · 23:59 BRT
            </span>
          </div>
          <span style={{ fontSize: 18, color: '#52525b' }}>
            doutor gigabyte
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
