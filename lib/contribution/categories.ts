import {
  Droplets,
  HousePlus,
  Landmark,
  Bus,
  Home,
  TreePine,
  Palmtree,
  MessageCircleQuestion,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from './types';

/**
 * As 8 categorias do PRD §5.5 com label PT-BR, ícone lucide e frase-exemplo.
 * Renderizado em step-category.tsx como radio cards.
 */
export type CategoryConfig = {
  slug: Category;
  label: string;
  icon: LucideIcon;
  example: string;
};

export const CATEGORY_CONFIG: readonly CategoryConfig[] = [
  {
    slug: 'drenagem-urbana',
    label: 'Drenagem urbana',
    icon: Droplets,
    example: 'Ruas que alagam, falta de boca-de-lobo, esgoto a céu aberto.',
  },
  {
    slug: 'ocupacao-irregular',
    label: 'Ocupação irregular',
    icon: HousePlus,
    example: 'Construções em área de preservação, loteamentos sem licença.',
  },
  {
    slug: 'patrimonio',
    label: 'Patrimônio histórico',
    icon: Landmark,
    example: 'Forte de Santo Inácio, igrejas, casarões, paisagem cultural.',
  },
  {
    slug: 'mobilidade',
    label: 'Mobilidade',
    icon: Bus,
    example: 'Trânsito, transporte público, calçadas, ciclovias, acessos.',
  },
  {
    slug: 'habitacao',
    label: 'Habitação',
    icon: Home,
    example: 'Moradia popular, regularização fundiária, áreas de risco.',
  },
  {
    slug: 'meio-ambiente',
    label: 'Meio ambiente',
    icon: TreePine,
    example: 'Mangues, rios Ariquindá e Mamucabas, mata atlântica, fauna.',
  },
  {
    slug: 'turismo',
    label: 'Turismo',
    icon: Palmtree,
    example: 'Praia dos Carneiros, hospedagem, ordenamento da orla.',
  },
  {
    slug: 'outro',
    label: 'Outro',
    icon: MessageCircleQuestion,
    example: 'Qualquer outro tema relacionado ao Plano Diretor.',
  },
] as const;

export function getCategory(slug: Category): CategoryConfig {
  const cfg = CATEGORY_CONFIG.find((c) => c.slug === slug);
  if (!cfg) {
    // Garantido em runtime: o type Category só permite esses slugs.
    throw new Error(`Categoria desconhecida: ${slug}`);
  }
  return cfg;
}
