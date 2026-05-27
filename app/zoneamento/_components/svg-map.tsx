'use client';

import { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import type { Macroarea } from '@/lib/zoneamento/macroareas';

/**
 * Normaliza geometria que vem do seed (que tem Polygon padrão E MultiPolygon
 * mal-formatado — cada "elemento" do MultiPolygon é um array de pontos em vez
 * de array de anéis). Converte tudo pra MultiPolygon válido pelo GeoJSON spec.
 */
function normalizeGeometry(g: unknown): Geometry | null {
  if (!g || typeof g !== 'object') return null;
  const geom = g as { type?: string; coordinates?: unknown };

  if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
    // coordinates: [[[lng,lat], ...]]  (rings[points])
    return { type: 'Polygon', coordinates: geom.coordinates as number[][][] };
  }
  if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
    // Seed bug: coordinates: [[lng,lat], ...][] (cada item é um array de pontos)
    // Esperado: [[[[lng,lat],...]]] (multipolygon → polygons → rings → points)
    // Convertemos cada item em um polygon com 1 ring exterior.
    const looksMalformed = (geom.coordinates as unknown[]).every(
      (p) => Array.isArray(p) && p.length > 0 && typeof (p as unknown[])[0] === 'object' && !Array.isArray(((p as unknown[])[0] as unknown[])[0]),
    );
    if (looksMalformed) {
      return {
        type: 'MultiPolygon',
        coordinates: (geom.coordinates as number[][][]).map((points) => [points]),
      };
    }
    return { type: 'MultiPolygon', coordinates: geom.coordinates as number[][][][] };
  }
  return null;
}

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

  const { projection, pathBuilder, validFeatures } = useMemo(() => {
    // Normaliza geometrias (lida com Polygon e MultiPolygon malformado do seed)
    const features: Array<Feature & { properties: { slug: string; color: string; name: string } }> = [];
    for (const m of macroareas) {
      const geom = normalizeGeometry(m.geojson);
      if (!geom) continue;
      features.push({
        type: 'Feature',
        properties: { slug: m.slug, color: m.display_color, name: m.name },
        geometry: geom,
      });
    }

    const featureCollection = {
      type: 'FeatureCollection' as const,
      features,
    };

    // Fallback projection se não houver features válidas (mostra Tamandaré centrado)
    let proj;
    try {
      proj = features.length > 0
        ? geoMercator().fitExtent(
            [
              [PADDING, PADDING],
              [VIEWPORT_WIDTH - PADDING, VIEWPORT_HEIGHT - PADDING],
            ],
            featureCollection,
          )
        : geoMercator().center([-35.1031, -8.7553]).scale(50000).translate([VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2]);
    } catch {
      proj = geoMercator().center([-35.1031, -8.7553]).scale(50000).translate([VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2]);
    }

    return {
      projection: proj,
      pathBuilder: geoPath(proj),
      validFeatures: features,
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
          {validFeatures.map((feature) => {
            const slug = feature.properties.slug;
            const color = feature.properties.color;
            const name = feature.properties.name;
            const isSelected = selected === slug;
            const isHovered = hovered === slug;
            const active = isSelected || isHovered;

            let d = '';
            let centroid: [number, number] | null = null;
            try {
              d = pathBuilder(feature) ?? '';
              const c = pathBuilder.centroid(feature);
              if (Number.isFinite(c[0]) && Number.isFinite(c[1])) {
                centroid = [c[0], c[1]];
              }
            } catch {
              // pula esse polygon
            }
            if (!d) return null;

            return (
              <g key={slug}>
                <path
                  d={d}
                  fill={color}
                  fillOpacity={active ? 0.85 : 0.55}
                  stroke="#fff"
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="cursor-pointer transition-[fill-opacity,stroke-width]"
                  onClick={() => onSelect(slug)}
                  onMouseEnter={() => setHovered(slug)}
                  onMouseLeave={() => setHovered(null)}
                  role="button"
                  aria-label={name}
                />
                {active && centroid && (
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
                      {name.replace(
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
