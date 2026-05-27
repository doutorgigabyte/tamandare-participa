/**
 * lib/docs/glossary.ts
 *
 * Glossário de parâmetros construtivos e termos urbanísticos. Linguagem
 * deliberadamente acessível a leigos — o estudo do ICR aponta que essa
 * clareza é o que falta na legislação atual de Tamandaré.
 *
 * Cada termo pode referenciar uma ou mais seções de documento (helpers em
 * `pdfPageUrl`) pra que o cidadão chegue na fonte oficial sem se perder.
 */

import type { DocId } from './sources';

export type GlossaryTerm = {
  slug: string;
  term: string;
  shortDef: string;
  longDef: string;
  example?: string;
  /** Seções de documento que tratam deste termo */
  refs?: Array<{
    doc: DocId;
    section: string; // slug da seção
    page: number;
    label: string;
  }>;
  /** Categoria pra agrupar no glossário */
  category:
    | 'parametros'
    | 'zonas'
    | 'instrumentos'
    | 'planejamento'
    | 'patrimonio';
};

export const GLOSSARY: GlossaryTerm[] = [
  // ---- PARÂMETROS CONSTRUTIVOS ------------------------------------------
  {
    slug: 'gabarito',
    term: 'Gabarito',
    shortDef: 'Altura máxima permitida pra uma construção.',
    longDef:
      'É o limite, em metros ou em número de pavimentos (andares), até onde uma edificação pode subir num determinado lote. O gabarito muda conforme a zona urbana: perto da praia, costuma ser mais baixo pra proteger paisagem e ambiente; em áreas centrais, pode ser mais alto.',
    example:
      'Em Carneiros, a lei de 2002 permitia até 4 pavimentos pra hotéis na faixa de praia. O estudo do ICR sugere reduzir esse gabarito pra evitar sombrear a areia e proteger o ecossistema.',
    refs: [
      {
        doc: 'caderno',
        section: 'uso-ocupacao-solo',
        page: 22,
        label: 'Altura das edificações em relação à praia em Carneiros',
      },
    ],
    category: 'parametros',
  },
  {
    slug: 'taxa-de-ocupacao',
    term: 'Taxa de ocupação',
    shortDef: 'Quanto do terreno pode ser coberto por construção (em %).',
    longDef:
      'É a relação entre a projeção da edificação no chão e a área total do lote. Uma taxa de ocupação de 60% significa que 60% do terreno pode ter prédio em cima, e 40% precisa ficar livre (jardim, recuo, área permeável). Diretamente ligada à drenagem urbana — quanto menor a taxa, mais a água da chuva consegue infiltrar no solo.',
    example:
      'Reduzir a taxa de ocupação em áreas com problema de alagamento (como partes do centro de Tamandaré) ajuda a desafogar o sistema de macrodrenagem.',
    refs: [
      {
        doc: 'caderno',
        section: 'uso-ocupacao-solo',
        page: 25,
        label: 'Em síntese — propostas de aperfeiçoamento',
      },
    ],
    category: 'parametros',
  },
  {
    slug: 'coeficiente-de-aproveitamento',
    term: 'Coeficiente de aproveitamento (CA)',
    shortDef:
      'Multiplicador que define quanto se pode construir em relação ao tamanho do terreno.',
    longDef:
      'Se o CA é 2, a soma de todos os andares (área construída total) pode chegar ao dobro da área do terreno. CA de 1 = só um andar cobrindo todo o lote, ou dois andares cobrindo metade. É o principal instrumento pra controlar densidade urbana.',
    example:
      'Um terreno de 200 m² com CA = 2 permite até 400 m² de área construída — pode ser um térreo + 1.º andar inteiros, ou um sobrado mais alto em parte do lote.',
    category: 'parametros',
  },
  {
    slug: 'recuo-frontal',
    term: 'Recuo frontal',
    shortDef:
      'Distância mínima entre a construção e o limite do lote com a rua.',
    longDef:
      'É o espaço entre a fachada do prédio e a calçada. Garante luz, ventilação, ajardinamento e, em casos de alargamento futuro da via, espaço pra ampliar a rua sem demolir.',
    category: 'parametros',
  },
  {
    slug: 'afastamento-lateral',
    term: 'Afastamento lateral',
    shortDef: 'Distância mínima entre a construção e os vizinhos laterais.',
    longDef:
      'Espaço entre a edificação e a divisa lateral do lote. Garante ventilação cruzada, iluminação natural, privacidade entre janelas, e — em prédios — evita que se forme um "paredão" no quarteirão.',
    example:
      'O Plano vigente de 2002 exigia de 2 a 5 metros pra terrenos com mais de 10m de testada. Alterações posteriores flexibilizaram em alguns casos. A revisão precisa decidir o equilíbrio entre flexibilidade construtiva e qualidade urbana.',
    refs: [
      {
        doc: 'caderno',
        section: 'uso-ocupacao-solo',
        page: 24,
        label: 'Afastamentos laterais — análise',
      },
    ],
    category: 'parametros',
  },
  {
    slug: 'testada',
    term: 'Testada',
    shortDef: 'Largura do terreno na frente da rua.',
    longDef:
      'É a medida da divisa do lote que dá pra via pública. Determina o quão "estreito" ou "largo" o terreno é. Lotes com testada pequena (< 10m) geralmente não comportam afastamento lateral.',
    category: 'parametros',
  },
  {
    slug: 'fachada-ativa',
    term: 'Fachada ativa',
    shortDef:
      'Quando o térreo do prédio se comunica diretamente com a calçada (comércio, vitrine, acesso).',
    longDef:
      'O contrário de muro cego. Cria animação urbana e segurança ("olhos pra rua"). Costuma ser exigido em zonas comerciais e centralidades novas.',
    category: 'parametros',
  },
  // ---- ZONAS ESPECIAIS ----------------------------------------------------
  {
    slug: 'macroarea',
    term: 'Macroárea',
    shortDef:
      'Grande recorte do território da cidade com regras urbanísticas próprias.',
    longDef:
      'Diferente de "bairro" (que tem caráter cultural/identitário), a macroárea é um instrumento técnico que agrupa zonas com problemas e potenciais semelhantes pra aplicar regras coerentes (gabarito, uso, densidade). Tamandaré propõe 10 macroáreas na revisão.',
    refs: [
      {
        doc: 'circular',
        section: '001-2026',
        page: 3,
        label: 'Configuração das macroáreas propostas',
      },
    ],
    category: 'zonas',
  },
  {
    slug: 'zeis',
    term: 'ZEIS — Zona Especial de Interesse Social',
    shortDef:
      'Zona destinada à habitação de baixa renda, com regras flexíveis pra regularização.',
    longDef:
      'Instrumento do Estatuto da Cidade (Lei 10.257/2001) usado pra reconhecer ocupações irregulares ou destinar áreas pra programas habitacionais. Permite parâmetros urbanísticos próprios (lotes menores, recuos reduzidos) pra viabilizar moradia digna pra famílias de baixa renda.',
    category: 'zonas',
  },
  {
    slug: 'zepa',
    term: 'ZEPA — Zona Especial de Proteção Ambiental',
    shortDef: 'Área protegida por valor ambiental (mata, mangue, dunas, orla).',
    longDef:
      'Em ZEPA, construir é restrito ou proibido pra preservar ecossistemas. Em Tamandaré, áreas como a Reserva de Saltinho, os mangues do Ariquindá/Mamucabas e a faixa de praia de Carneiros costumam entrar nessa categoria.',
    category: 'zonas',
  },
  {
    slug: 'zone-especial-patrimonio',
    term: 'Zona Especial de Patrimônio Histórico',
    shortDef:
      'Área tombada ou de interesse cultural com restrições pra preservar a paisagem urbana.',
    longDef:
      'Em torno do Forte de Santo Inácio, das igrejas históricas e do centro antigo, costumam haver regras especiais limitando gabarito e estilo arquitetônico, pra que novas construções não anulem o protagonismo do patrimônio.',
    refs: [
      {
        doc: 'caderno',
        section: 'uso-ocupacao-solo',
        page: 23,
        label: 'Altura das edificações em relação à edificações históricas',
      },
    ],
    category: 'patrimonio',
  },
  // ---- INSTRUMENTOS URBANÍSTICOS ------------------------------------------
  {
    slug: 'outorga-onerosa',
    term: 'Outorga onerosa do direito de construir',
    shortDef:
      'Mecanismo pelo qual o município "vende" potencial construtivo acima do básico.',
    longDef:
      'Se a lei diz que CA básico de uma zona é 1, mas o máximo permitido é 4, o construtor pode comprar do município o direito de chegar a 4 — pagando uma contrapartida em dinheiro ou obra. O município arrecada e usa pra investir em infraestrutura ou habitação social.',
    category: 'instrumentos',
  },
  {
    slug: 'iptu-progressivo',
    term: 'IPTU progressivo no tempo',
    shortDef:
      'Cobrança crescente em terrenos urbanos não utilizados, pra forçar uso ou venda.',
    longDef:
      'Previsto no Estatuto da Cidade. Se um lote bem localizado fica vazio (especulação imobiliária), o IPTU sobe ano a ano até um teto. Se o dono não construir ou vender, o município pode até desapropriar. Combate "vazios urbanos" e pressiona a cidade a usar terra dentro da malha urbana antes de expandir pra periferia.',
    category: 'instrumentos',
  },
  {
    slug: 'eiv',
    term: 'EIV — Estudo de Impacto de Vizinhança',
    shortDef:
      'Análise técnica obrigatória pra empreendimentos grandes, considerando vizinhança.',
    longDef:
      'Antes de licenciar um shopping, hotel grande, condomínio fechado etc., o município pode exigir um EIV que avalie impactos em trânsito, paisagem, sombreamento, ventilação, geração de demanda em escolas/saúde, etc. Permite condicionar a aprovação a contrapartidas.',
    category: 'instrumentos',
  },
  {
    slug: 'macrodrenagem',
    term: 'Macrodrenagem',
    shortDef:
      'Sistema de captação e escoamento de água de chuva em escala urbana.',
    longDef:
      'Bocas de lobo, galerias, canais e córregos que recebem a água das chuvas e escoam até o mar/rio. Quando o solo é muito impermeabilizado (taxa de ocupação alta + asfalto), a macrodrenagem fica sobrecarregada e ocorrem alagamentos. Por isso o estudo recomenda reduzir taxa de ocupação em áreas críticas.',
    category: 'planejamento',
  },
  {
    slug: 'plano-diretor',
    term: 'Plano Diretor',
    shortDef:
      'Lei urbanística principal de um município — define como a cidade cresce.',
    longDef:
      'Obrigatório pra cidades com mais de 20 mil habitantes, pelo Estatuto da Cidade. Define macrozoneamento, instrumentos urbanísticos, diretrizes pra mobilidade, habitação, meio ambiente, patrimônio. Em Tamandaré, é a Lei 184/2002 — que está sendo revisada agora.',
    refs: [
      {
        doc: 'circular',
        section: '001-2026',
        page: 1,
        label: 'Introdução e enquadramento legal',
      },
    ],
    category: 'planejamento',
  },
];

export const GLOSSARY_CATEGORIES: Array<{
  id: GlossaryTerm['category'];
  label: string;
  description: string;
}> = [
  {
    id: 'parametros',
    label: 'Parâmetros construtivos',
    description:
      'O que dita quanto, quão alto e onde se pode construir num lote.',
  },
  {
    id: 'zonas',
    label: 'Zonas e macroáreas',
    description: 'Como o território da cidade é dividido em regras distintas.',
  },
  {
    id: 'instrumentos',
    label: 'Instrumentos urbanísticos',
    description:
      'Mecanismos que o município usa pra arrecadar, regular e induzir o desenvolvimento urbano.',
  },
  {
    id: 'patrimonio',
    label: 'Patrimônio',
    description: 'Proteção de prédios históricos e da paisagem cultural.',
  },
  {
    id: 'planejamento',
    label: 'Planejamento urbano',
    description: 'Conceitos gerais e infraestrutura.',
  },
];

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
