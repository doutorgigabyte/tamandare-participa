/**
 * lib/images/photos.ts
 *
 * Fotos de Tamandaré usadas na plataforma. Todas vêm do Wikimedia Commons
 * sob licenças Creative Commons que EXIGEM crédito ao autor + link à licença.
 *
 * Sempre que uma foto for exibida, o componente correspondente deve renderizar
 * o crédito (ex: `<PhotoCredit photo={PHOTOS.carneirosCapela} />`).
 *
 * Versões: as fotos foram convertidas pra .webp (1920x1280 max, qualidade 82)
 * via script de otimização — originais não estão no repo.
 */

export type PhotoCredit = {
  src: string;
  alt: string;
  caption: string;
  author: string;
  authorUrl?: string;
  license: 'CC BY 2.0' | 'CC BY-SA 3.0' | 'CC BY-SA 4.0';
  licenseUrl: string;
  sourceUrl: string;
  /** Aspecto preferido — width / height aproximado pra layout */
  aspect: 'wide' | 'square' | 'portrait';
};

export const PHOTOS = {
  carneirosCapela: {
    src: '/images/tamandare/carneiros-capela.webp',
    alt: 'Capela de São Benedito (1910) na Praia dos Carneiros, ao fundo o coqueiral e o mar verde-azulado',
    caption: 'Capela de São Benedito (1910), Praia dos Carneiros',
    author: 'Antonino Visalli Neto',
    authorUrl: 'https://www.flickr.com/people/137875313@N08',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Capela_de_S%C3%A3o_Benedito_constru%C3%ADda_em_1910_na_Praia_dos_Carneiros.jpg',
    aspect: 'wide',
  },
  carneirosPraia: {
    src: '/images/tamandare/carneiros-praia.webp',
    alt: 'Praia dos Carneiros em Tamandaré/PE — areia clara, coqueiros e mar calmo',
    caption: 'Praia dos Carneiros',
    author: 'Andrei',
    authorUrl: 'https://www.flickr.com/people/13280015@N05',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Praia_dos_Carneiros_-_Pernambuco_-_Brasil_(4).jpg',
    aspect: 'wide',
  },
  forteSantoInacio: {
    src: '/images/tamandare/forte-santo-inacio.webp',
    alt: 'Fachada de entrada do Forte de Santo Inácio de Loyola em Tamandaré',
    caption: 'Forte de Santo Inácio de Loyola (séc. XVII)',
    author: 'Forte Santo Inácio',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Fachada_de_Entrada_do_Forte_Santo_In%C3%A1cio_de_Loyola.jpg',
    aspect: 'wide',
  },
  igrejaSaoPedro: {
    src: '/images/tamandare/igreja-sao-pedro.webp',
    alt: 'Igreja de São Pedro na orla de Tamandaré, fachada branca contra o mar',
    caption: 'Igreja de São Pedro, orla de Tamandaré',
    author: 'DlauriniJr',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Tamandar%C3%A9_-_Igreja_de_S%C3%A3o_Pedro.jpg',
    aspect: 'wide',
  },
  pescadores: {
    src: '/images/tamandare/pescadores.webp',
    alt: 'Pescadores trabalhando próximo a córrego de água doce em Tamandaré',
    caption: 'Comunidade pesqueira, Tamandaré',
    author: 'Timo Sachsenberg',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Fishermen_-_Tamandar%C3%A9_-_Brasil_pan.jpg',
    aspect: 'wide',
  },
  costaCorais: {
    src: '/images/tamandare/costa-corais.webp',
    alt: 'Costa dos Corais em Tamandaré/PE — recifes e mar raso',
    caption: 'Costa dos Corais, Tamandaré',
    author: 'Jobosco',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Costa_dos_corais,_Tamandar%C3%A9-PE.jpg',
    aspect: 'wide',
  },
} as const satisfies Record<string, PhotoCredit>;

export type PhotoKey = keyof typeof PHOTOS;
