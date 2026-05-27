/**
 * lib/docs/images.ts
 *
 * Imagens extraídas dos PDFs oficiais (capas, mapas, diagramas) — todas em
 * public/images/docs/ como .webp otimizadas. Crédito vai sempre pro autor
 * original do documento (Prefeitura ou ICR).
 *
 * Pra adicionar uma imagem nova:
 *   1. Extrair via `pdftoppm -png -r 200 -f N -l N input.pdf saida`
 *   2. Otimizar via sharp pra .webp (max 1600px, q82)
 *   3. Adicionar entrada em DOC_IMAGES, em `cover` ou `sections[slug]`
 */

import type { DocId } from './sources';

export type DocImage = {
  src: string;
  alt: string;
  caption: string;
  /** Página do PDF original */
  page: number;
  credit: string;
  /** Disposição preferida (informativo) */
  aspect?: 'wide' | 'figure';
};

type DocImagesMap = {
  cover?: DocImage;
  sections: Record<string, DocImage[]>;
};

export const DOC_IMAGES: Record<DocId, DocImagesMap> = {
  caderno: {
    cover: {
      src: '/images/docs/caderno-capa.webp',
      alt: 'Capa do estudo "Tamandaré-PE — Análise Preliminar do Plano Diretor Municipal" do Instituto Cidades Responsivas, com vista aérea/satélite do município em tons escuros',
      caption: 'Capa do estudo (ICR, abril/2026)',
      page: 1,
      credit: 'Instituto Cidades Responsivas',
    },
    sections: {
      'uso-ocupacao-solo': [
        {
          src: '/images/docs/caderno-pag22-volumetria-carneiros.webp',
          alt: 'Diagramas 3D comparando edificações de 4 pavimentos versus 2 pavimentos junto à praia de Carneiros, mostrando o impacto de sombreamento',
          caption:
            'Simulação 3D: 4 pavimentos vs 2 pavimentos junto à Praia dos Carneiros',
          page: 22,
          credit: 'Instituto Cidades Responsivas',
          aspect: 'wide',
        },
        {
          src: '/images/docs/caderno-pag23-edificacoes-historicas.webp',
          alt: 'Foto de igreja histórica em Tamandaré com indicação visual de altura máxima de 4 pavimentos pra edificações vizinhas',
          caption:
            'Patrimônio histórico e gabarito do entorno — o Plano vigente não protege a paisagem cultural',
          page: 23,
          credit: 'Instituto Cidades Responsivas',
          aspect: 'wide',
        },
      ],
      'indicador-habitacional': [
        {
          src: '/images/docs/caderno-pag31-acesso-habitacional.webp',
          alt: 'Mapa de Tamandaré com pontos coloridos indicando preço de venda por m² de apartamentos em diferentes áreas',
          caption:
            'Indicador "Acesso habitacional": preço por m² de apartamentos à venda em Tamandaré',
          page: 31,
          credit: 'Instituto Cidades Responsivas',
          aspect: 'wide',
        },
      ],
      'indicador-emprego-mobilidade': [
        {
          src: '/images/docs/caderno-pag41-mobilidade-emprego.webp',
          alt: 'Mapa hexagonal de Tamandaré mostrando relação entre empregos e domicílios alcançáveis em até 40 minutos de carro',
          caption:
            'Indicador "Mobilidade e emprego": empregos alcançáveis em até 40 min de carro',
          page: 41,
          credit: 'Instituto Cidades Responsivas',
          aspect: 'wide',
        },
      ],
      'indicador-vegetacao-patrimonio': [
        {
          src: '/images/docs/caderno-pag45-vegetacao-densidades.webp',
          alt: 'Mapa de Tamandaré em tons de verde indicando densidade de vegetação (NDVI) por setor censitário',
          caption:
            'Indicador "Vegetação e densidades": cobertura verde no entorno dos domicílios',
          page: 45,
          credit: 'Instituto Cidades Responsivas',
          aspect: 'wide',
        },
        {
          src: '/images/docs/caderno-pag49-patrimonio.webp',
          alt: 'Mapa de Tamandaré com indicação de imóveis de interesse cultural e patrimônio edificado',
          caption:
            'Indicador "Identidade e patrimônio": imóveis de interesse cultural',
          page: 49,
          credit: 'Instituto Cidades Responsivas',
          aspect: 'wide',
        },
      ],
    },
  },
  circular: {
    cover: {
      src: '/images/docs/circular-capa.webp',
      alt: 'Página 1 da Circular 001-2026 da Prefeitura de Tamandaré convocando para a Audiência Pública',
      caption: 'Página 1 da Circular 001-2026',
      page: 1,
      credit: 'Prefeitura Municipal de Tamandaré',
    },
    sections: {
      '001-2026': [
        {
          src: '/images/docs/circular-pag4-mapa-zoneamento.webp',
          alt: 'Mapa oficial do novo zoneamento proposto pra Tamandaré, com 10 macroáreas coloridas (Lazer e Turismo em roxo, Orla Carneiros, Conservação Ambiental em verde, Orla Tamandaré em amarelo, Centro Tamandaré em vermelho, etc.) e legenda completa',
          caption:
            'Mapa-síntese do novo zoneamento proposto (10 macroáreas + zonas especiais)',
          page: 4,
          credit: 'Prefeitura Municipal de Tamandaré / consultoria técnica',
          aspect: 'wide',
        },
      ],
    },
  },
};

export function getDocCover(doc: DocId): DocImage | null {
  return DOC_IMAGES[doc].cover ?? null;
}

export function getSectionImages(doc: DocId, sectionSlug: string): DocImage[] {
  return DOC_IMAGES[doc].sections[sectionSlug] ?? [];
}
