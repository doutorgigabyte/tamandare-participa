'use client';

import { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import rewind from '@mapbox/geojson-rewind';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { Macroarea } from '@/lib/zoneamento/macroareas';

/**
 * Corrige winding order dos polígonos. d3-geo trata polygons com winding
 * "errado" como buracos no mundo todo (geoArea retorna 4π em vez de área
 * real do polygon). Confirmado experimentalmente:
 *   - Original do seed: geoArea = 12.566 (4π = esfera inteira)
 *   - Após rewind(true): geoArea = 1.87e-7 (área real)
 *
 * `rewind(geom, true)` força right-hand rule (outer = clockwise quando visto
 * com norte pra cima), o que é o que d3-geo espera.
 */
function fixWinding<G extends Polygon | MultiPolygon>(geom: G): G {
  return rewind(geom, true) as G;
}

/**
 * SVG nativo renderizando os polígonos das 10 macroáreas — sem dependência
 * de Google Maps key. Usa d3-geo pra projeção Mercator.
 *
 * O seed (db/seed/macroareas.example.json) tem mix de Polygon (4) e
 * MultiPolygon (6) — ambos formatos GeoJSON válidos. Aqui a gente confia no
 * payload e só guarda defensivamente em try/catch quando d3-geo processa cada
 * feature.
 */

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const PADDING = 24;

type Props = {
  macroareas: Macroarea[];
  selected: string | null;
  onSelect: (slug: string) => void;
};

type MacroFeature = Feature<Polygon | MultiPolygon, {
  slug: string;
  color: string;
  name: string;
}>;

export function SvgMap({ macroareas, selected, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { projection, pathBuilder, validFeatures } = useMemo(() => {
    // Compõe FeatureCollection a partir do seed — confia no formato GeoJSON
    const features: MacroFeature[] = [];
    for (const m of macroareas) {
      const geom = m.geojson as unknown as Polygon | MultiPolygon;
      if (!geom || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) {
        continue;
      }
      if (!Array.isArray(geom.coordinates) || geom.coordinates.length === 0) {
        continue;
      }
      features.push({
        type: 'Feature',
        properties: { slug: m.slug, color: m.display_color, name: m.name },
        geometry: fixWinding(geom),
      });
    }

    const collection = { type: 'FeatureCollection' as const, features };

    // Auto-fit em todos os features juntos. Se fitExtent falhar (geometrias
    // inválidas), cai pra projeção fixa centrada em Tamandaré com scale
    // calibrado pro município inteiro caber.
    let proj;
    try {
      proj = geoMercator().fitExtent(
        [
          [PADDING, PADDING],
          [VIEWPORT_WIDTH - PADDING, VIEWPORT_HEIGHT - PADDING],
        ],
        collection,
      );
    } catch {
      proj = geoMercator()
        .center([-35.13, -8.76])
        .scale(110000)
        .translate([VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2]);
    }

    return {
      projection: proj,
      pathBuilder: geoPath(proj),
      validFeatures: features,
    };
  }, [macroareas]);

  // Ordena pra desenhar polygons "grandes" primeiro e "pequenos" por cima
  // (evita que centro-tamandare cubra orla pequena, etc.). Usa o número de
  // pontos como proxy de tamanho — quanto mais pontos, geralmente mais área.
  const featuresOrdered = useMemo(() => {
    return [...validFeatures].sort((a, b) => {
      const sizeA = countPoints(a.geometry);
      const sizeB = countPoints(b.geometry);
      return sizeB - sizeA; // maior primeiro (renderizado por baixo)
    });
  }, [validFeatures]);

  return (
    <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-atlantico-areia-quente/40 lg:h-[640px]">
      <svg
        viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label="Mapa das 10 macroáreas propostas pra Tamandaré"
      >
        {/* fundo */}
        <rect
          x={0}
          y={0}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          fill="hsl(34 71% 96%)"
        />

        {/* polígonos */}
        <g>
          {featuresOrdered.map((feature) => {
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
              return null;
            }
            if (!d) return null;

            return (
              <g key={slug}>
                <path
                  d={d}
                  fill={color}
                  fillOpacity={active ? 0.85 : 0.6}
                  stroke="#fff"
                  strokeWidth={isSelected ? 2.5 : 1.2}
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
                      {shortName(name)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Marcador "Sede" — fica acima dos polígonos */}
        {(() => {
          const p = projection([-35.1031, -8.7553]);
          if (!p) return null;
          return (
            <g pointerEvents="none">
              <circle
                cx={p[0]}
                cy={p[1]}
                r={4}
                fill="hsl(207 31% 15%)"
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                x={p[0] + 8}
                y={p[1] + 4}
                fontSize={10}
                fill="hsl(207 31% 15%)"
                fontWeight={600}
              >
                Sede
              </text>
            </g>
          );
        })()}
      </svg>

      <div className="absolute bottom-2 right-2 max-w-[260px] rounded-md bg-white/90 px-2.5 py-1.5 text-[10px] leading-snug text-muted-foreground shadow-soft backdrop-blur-sm">
        Mapa esquemático. {validFeatures.length} de {macroareas.length} macroáreas
        renderizadas (polígonos são aproximação visual).
      </div>
    </div>
  );
}

function shortName(name: string): string {
  return name.replace(
    /^(?:Macroárea|Zona Especial) (?:de |dos? |Centro )?/,
    '',
  );
}

function countPoints(geom: Polygon | MultiPolygon): number {
  if (geom.type === 'Polygon') {
    return geom.coordinates.reduce((acc, ring) => acc + ring.length, 0);
  }
  return geom.coordinates.reduce(
    (acc, poly) =>
      acc + poly.reduce((subAcc, ring) => subAcc + ring.length, 0),
    0,
  );
}
