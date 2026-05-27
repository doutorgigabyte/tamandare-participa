/**
 * Dados dos 5 indicadores de desempenho urbano calculados pelo
 * Instituto Cidades Responsivas para Tamandaré/PE.
 *
 * Fontes: Caderno ICR pp. 26-52 (extraído em docs/sources/caderno/03-05*.md).
 *
 * Cada indicador vira uma página em /diagnostico/[indicador] + um card no índice.
 */

export type IndicadorSlug =
  | 'acesso-habitacional'
  | 'emprego-moradia'
  | 'mobilidade-emprego'
  | 'vegetacao-densidade'
  | 'patrimonio-identidade';

export type IndicadorColor = 'red' | 'amber' | 'green' | 'blue';

export type IndicadorComparison = {
  label: string;
  value: number;
  isCurrent?: boolean;
};

export type Indicador = {
  slug: IndicadorSlug;
  title: string;
  short_title: string;
  subtitle: string;
  big_number: string; // formatted (com %, vírgula, etc.)
  big_number_unit: string;
  ranking_label: string;
  color: IndicadorColor;
  plain_language: string;
  plano_meaning: string[];
  citation: { source: 'caderno' | 'circular'; page: number };
  related_category:
    | 'habitacao'
    | 'mobilidade'
    | 'meio-ambiente'
    | 'patrimonio'
    | 'turismo';
  comparison: {
    title: string;
    unit?: string;
    items: IndicadorComparison[];
    higherIsBetter: boolean;
  };
};

export const INDICADORES: Indicador[] = [
  // ===========================================================================
  // 1. ACESSO HABITACIONAL
  // ===========================================================================
  {
    slug: 'acesso-habitacional',
    title: 'Acesso habitacional',
    short_title: 'Habitação',
    subtitle:
      'Quanto da renda uma família comprometeria pra pagar uma casa mediana',
    big_number: '119%',
    big_number_unit: '',
    ranking_label: '28º de 28 — o pior cenário do Brasil',
    color: 'red',
    plain_language:
      'Uma família de Tamandaré precisaria comprometer 119% da renda mensal pra pagar a parcela de uma casa mediana. Ou seja: mais do que ganha. É o cenário mais caro do Brasil entre as cidades comparáveis, pior até que São Luís (118%) e Maceió (98%). O motivo: o preço mediano (R$ 443 mil) é razoável, mas a renda domiciliar média (R$ 2.455) é a mais baixa do levantamento.',
    plano_meaning: [
      'Prever zonas de densificação no entorno do Centro pra aumentar oferta e baixar preços.',
      'Atenção: nas zonas mais valorizadas (Carneiros, Pontal), a pressão imobiliária do turismo expulsa a população local — o Plano precisa garantir moradia acessível em outras zonas.',
      'Faixa central da sede urbana mantém gabarito de 6 pavimentos pra acomodar densidade.',
    ],
    citation: { source: 'caderno', page: 30 },
    related_category: 'habitacao',
    comparison: {
      title: 'Renda comprometida — pior cenário do Brasil',
      unit: '%',
      higherIsBetter: false,
      items: [
        { label: 'Recife', value: 79 },
        { label: 'Maceió', value: 98 },
        { label: 'São Luís', value: 118 },
        { label: 'Tamandaré', value: 119, isCurrent: true },
      ],
    },
  },

  // ===========================================================================
  // 2. EMPREGO E LOCAL DE MORADIA
  // ===========================================================================
  {
    slug: 'emprego-moradia',
    title: 'Emprego e local de moradia',
    short_title: 'Empregos',
    subtitle: 'Quantos empregos formais existem por morador ocupado',
    big_number: '0,20',
    big_number_unit: 'empregos/ocupado',
    ranking_label: 'Penúltimo da região — só Água Preta tem menos',
    color: 'amber',
    plain_language:
      'Tamandaré gera poucos empregos formais pro tamanho da sua população ocupada. Boa parte dos moradores trabalha em municípios vizinhos. Turismo e comércio respondem por 43% dos empregos formais — mas essas atividades têm alta sazonalidade e informalidade. As 3 ocupações mais comuns no município: cana-de-açúcar (314 vínculos), servente de obras (248) e vendedor varejista (172).',
    plano_meaning: [
      'Criar incentivos pra USO MISTO (térreo comercial + andares residenciais) — gera empregos perto de onde a população mora.',
      'Reduzir outorga onerosa em 20% pra empreendimentos com uso misto, 10% adicional pra fachada ativa.',
      'Adensar eixos com infraestrutura existente vira corredor de centralidade econômica.',
    ],
    citation: { source: 'caderno', page: 36 },
    related_category: 'habitacao',
    comparison: {
      title: 'Empregos formais por morador ocupado na região',
      higherIsBetter: false, // valor menor = "perde" gente pra fora
      items: [
        { label: 'Escada', value: 0.31 },
        { label: 'São José da Coroa Grande', value: 0.3 },
        { label: 'Maragogi', value: 0.21 },
        { label: 'Tamandaré', value: 0.2, isCurrent: true },
      ],
    },
  },

  // ===========================================================================
  // 3. MOBILIDADE E EMPREGO
  // ===========================================================================
  {
    slug: 'mobilidade-emprego',
    title: 'Mobilidade e emprego',
    short_title: 'Mobilidade',
    subtitle: 'Empregos alcançáveis em até 45 minutos de carro, por domicílio',
    big_number: '0,99',
    big_number_unit: 'empregos/domicílio',
    ranking_label: '2º de 9 cidades — só atrás de São Paulo',
    color: 'green',
    plain_language:
      'Em até 45 minutos de carro, cada domicílio de Tamandaré tem em média 1 emprego acessível — o segundo melhor índice do levantamento, atrás apenas de São Paulo (1,03). A explicação: a cidade é pequena, e Sirinhaém, Rio Formoso e parte de Ipojuca (com indústrias) ficam dentro do raio de 45min. A periferia local não fica "longe do centro" como em capitais.',
    plano_meaning: [
      'Justifica densificar partes da sede urbana — a infraestrutura viária comporta.',
      'Próximo passo é aproximar empregos das residências via uso misto, pra exigir menos do sistema viário.',
      'Resultado contradiz o indicador anterior: a cidade NÃO gera muitos empregos, mas tem acesso fácil aos empregos da região.',
    ],
    citation: { source: 'caderno', page: 40 },
    related_category: 'mobilidade',
    comparison: {
      title: 'Empregos acessíveis em 45min entre 9 cidades',
      higherIsBetter: true,
      items: [
        { label: 'São Paulo', value: 1.03 },
        { label: 'Tamandaré', value: 0.99, isCurrent: true },
        { label: 'Belo Horizonte', value: 0.71 },
        { label: 'Salvador', value: 0.41 },
      ],
    },
  },

  // ===========================================================================
  // 4. VEGETAÇÃO E DENSIDADES
  // ===========================================================================
  {
    slug: 'vegetacao-densidade',
    title: 'Vegetação e densidades',
    short_title: 'Vegetação',
    subtitle: 'Densidade de vegetação no entorno dos domicílios (NDVI Landsat 8)',
    big_number: '0,36',
    big_number_unit: 'NDVI médio',
    ranking_label: 'Entre as 4 cidades com mais verde do Brasil',
    color: 'green',
    plain_language:
      'Tamandaré tem um dos mais altos índices de vegetação ao redor das residências entre as 28 capitais brasileiras — só Florianópolis (0,44), Rio Branco (0,38) e Palmas (0,36) aparecem na frente. Mas o destaque está na função ecossistêmica: morro dos Carneiros e entorno do rio Mamucabas funcionam como esponja, retendo águas pluviais e evitando sobrecarga da macrodrenagem.',
    plano_meaning: [
      'PRESERVAR essas áreas com zonas de baixa ocupação. Não densificar morros e APPs — é onde a chuva é absorvida.',
      'Concentrar densidades em áreas que JÁ ESTÃO ocupadas, perto do Centro.',
      'Incentivos pra áreas permeáveis em novos empreendimentos privados.',
    ],
    citation: { source: 'caderno', page: 47 },
    related_category: 'meio-ambiente',
    comparison: {
      title: 'NDVI médio no entorno dos domicílios (28 capitais)',
      higherIsBetter: true,
      items: [
        { label: 'Florianópolis', value: 0.44 },
        { label: 'Tamandaré', value: 0.36, isCurrent: true },
        { label: 'São Paulo', value: 0.23 },
        { label: 'Salvador', value: 0.2 },
      ],
    },
  },

  // ===========================================================================
  // 5. PATRIMÔNIO E IDENTIDADE
  // ===========================================================================
  {
    slug: 'patrimonio-identidade',
    title: 'Patrimônio e identidade',
    short_title: 'Patrimônio',
    subtitle: 'Quantidade de fotos georreferenciadas na cidade (API Flickr)',
    big_number: '239',
    big_number_unit: 'fotos no Pontal',
    ranking_label: 'Pontal compete com Florianópolis — mas Centro tem 10x menos',
    color: 'amber',
    plain_language:
      'A Praia do Pontal tem 239 fotos georreferenciadas — mais que a Praia do Campeche em Florianópolis (160). A Igreja de Carneiros aparece com 102 fotos, o Forte de Santo Inácio com 51. Já o Centro histórico de Tamandaré tem apenas 23 fotos — quase 10 vezes menos que o Pontal. Há um potencial turístico desperdiçado no Centro.',
    plano_meaning: [
      'Restrições de altura no entorno do Forte e das igrejas históricas pra dar protagonismo ao patrimônio.',
      'Estratégia de baixa ocupação em Carneiros e Pontal preserva o ativo paisagístico.',
      'Políticas específicas pra ATRAIR turismo pro Centro — valorizar o que tem ali e não está sendo aproveitado.',
    ],
    citation: { source: 'caderno', page: 49 },
    related_category: 'patrimonio',
    comparison: {
      title: 'Fotos georreferenciadas em pontos turísticos',
      unit: 'fotos',
      higherIsBetter: true,
      items: [
        { label: 'Anfiteatro Pôr do Sol (POA)', value: 251 },
        { label: 'Praia do Pontal (Tamandaré)', value: 239, isCurrent: true },
        { label: 'Praia do Campeche (Floripa)', value: 160 },
        { label: 'Centro de Tamandaré', value: 23 },
      ],
    },
  },
];

export function findIndicador(slug: string): Indicador | undefined {
  return INDICADORES.find((i) => i.slug === slug);
}

export const INDICADOR_SLUGS = INDICADORES.map((i) => i.slug);
