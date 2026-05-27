'use client';

import { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Macroarea } from '@/lib/zoneamento/macroareas';

/**
 * SVG nativo renderizando os polígonos das 10 macroáreas — sem dependência
 * de Google Maps key. Usa d3-geo pra projeção Mercator e calcula bounding
 * box automaticamente pra encaixar todos os polígonos no viewport.
 *
 * Vantagens vs Google Maps:
 *   - Zero dependência externa (sem key, sem custo, sem rate limit)
 *   - Bundle ~10x menor
 *   - Funciona offline
 *   - Renderiza mais rápido (sem tiles)
 *
 * Trade-off: sem ruas/satélite ao fundo. Mas pra mostrar zoneamento, esse
 * "ruído" geográfico atrapalha — o que importa é a forma + cor dos polígonos.
 */

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const PADDING = 24;

type Props = {
  macroareas: Macroarea[];
  selected: string | null;
  onSelect: (slug: string) => void;
};

export function SvgMap({ macroareas, selected, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { projection, pathBuilder, validMacroareas } = useMemo(() => {
    // Filtra macroáreas com geojson válido
    const valid = macroareas.filter(
      (m) =>
        m.geojson?.type === 'Polygon'
        && Array.isArray(m.geojson.coordinates)
        && m.geojson.coordinates.length > 0,
    );

    // Compõe FeatureCollection pra d3-geo calcular bounding box
    const featureCollection = {
      type: 'FeatureCollection' as const,
      features: valid.map((m) => ({
        type: 'Feature' as const,
        properties: { slug: m.slug },
        geometry: m.geojson,
      })),
    };

    const proj = geoMercator().fitExtent(
      [
        [PADDING, PADDING],
        [VIEWPORT_WIDTH - PADDING, VIEWPORT_HEIGHT - PADDING],
      ],
      featureCollection,
    );

    return {
      projection: proj,
      pathBuilder: geoPath(proj),
      validMacroareas: valid,
    };
  }, [macroareas]);

  return (
    <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-atlantico-areia-quente/40 lg:h-[640px]">
      <svg
        viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label="Mapa das 10 macroáreas propostas pra Tamandaré"
      >
        {/* fundo sutil */}
        <rect
          x={0}
          y={0}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          fill="hsl(34 71% 96%)"
        />

        {/* grid de referência (linhas suaves) */}
        <g stroke="hsl(34 25% 88%)" strokeWidth={0.5} opacity={0.5}>
          {[1, 2, 3].map((i) => (
            <line
              key={`v${i}`}
              x1={(VIEWPORT_WIDTH / 4) * i}
              y1={0}
              x2={(VIEWPORT_WIDTH / 4) * i}
              y2={VIEWPORT_HEIGHT}
            />
          ))}
          {[1, 2].map((i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(VIEWPORT_HEIGHT / 3) * i}
              x2={VIEWPORT_WIDTH}
              y2={(VIEWPORT_HEIGHT / 3) * i}
            />
          ))}
        </g>

        {/* polígonos */}
        <g>
          {validMacroareas.map((m) => {
            const isSelected = selected === m.slug;
            const isHovered = hovered === m.slug;
            const active = isSelected || isHovered;
            const d = pathBuilder({
              type: 'Feature',
              properties: {},
              geometry: m.geojson,
            } as Parameters<typeof pathBuilder>[0]) ?? '';

            // Centroide pra label
            const centroid = pathBuilder.centroid({
              type: 'Feature',
              properties: {},
              geometry: m.geojson,
            } as Parameters<typeof pathBuilder>[0]);

            return (
              <g key={m.slug}>
                <path
                  d={d}
                  fill={m.display_color}
                  fillOpacity={active ? 0.85 : 0.55}
                  stroke="#fff"
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="cursor-pointer transition-[fill-opacity,stroke-width]"
                  onClick={() => onSelect(m.slug)}
                  onMouseEnter={() => setHovered(m.slug)}
                  onMouseLeave={() => setHovered(null)}
                  role="button"
                  aria-label={m.name}
                />
                {/* Label: só mostra na hover/seleção pra não poluir */}
                {active
                  && centroid
                  && Number.isFinite(centroid[0])
                  && Number.isFinite(centroid[1]) && (
                  <g pointerEvents="none">
                    <rect
                      x={centroid[0] - 80}
                      y={centroid[1] - 14}
                      width={160}
                      height={22}
                      rx={4}
                      fill="hsl(207 31% 15%)"
                      fillOpacity={0.92}
                    />
                    <text
                      x={centroid[0]}
                      y={centroid[1] + 1}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={500}
                      fill="#fff"
                    >
                      {m.name.replace(
                        /^(?:Macroárea|Zona Especial) (?:de |dos? |Centro )?/,
                        '',
                      )}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Marcadores de referência: centro de Tamandaré */}
        {(() => {
          const centerPoint = projection([-35.1031, -8.7553]);
          if (!centerPoint) return null;
          return (
            <g pointerEvents="none">
              <circle
                cx={centerPoint[0]}
                cy={centerPoint[1]}
                r={4}
                fill="hsl(207 31% 15%)"
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                x={centerPoint[0] + 8}
                y={centerPoint[1] + 4}
                fontSize={10}
                fill="hsl(207 31% 15%)"
                fontWeight={500}
              >
                Sede
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Aviso de aproximação no canto */}
      <div className="absolute bottom-2 right-2 max-w-[280px] rounded-md bg-white/90 px-2.5 py-1.5 text-[10px] leading-snug text-muted-foreground shadow-soft backdrop-blur-sm">
        Mapa esquemático. Polígonos são aproximação visual até a digitalização
        do mapa-síntese oficial.
      </div>
    </div>
  );
}
