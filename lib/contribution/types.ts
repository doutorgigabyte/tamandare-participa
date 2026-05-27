/**
 * Tipos do wizard de contribuição cidadã (/contribuir).
 * PRD v1.0 §5.5 + §6 + §11.
 *
 * O state machine vive no useReducer de contribution-wizard.tsx.
 * O payload da API é validado por lib/contribution/schema.ts.
 */

export const CATEGORIES = [
  'drenagem-urbana',
  'ocupacao-irregular',
  'patrimonio',
  'mobilidade',
  'habitacao',
  'meio-ambiente',
  'turismo',
  'outro',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type AttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

export type IdentificationIdentified = {
  mode: 'identified';
  name: string;
  email: string;
  cpf?: string;
};

export type IdentificationAnonymous = {
  mode: 'anonymous';
};

export type Identification = IdentificationIdentified | IdentificationAnonymous;

/**
 * Estado do formulário durante o wizard.
 * Campos podem ser null/empty antes de cada etapa ser preenchida.
 */
export type FormState = {
  // Etapa 1 — Onde
  location_address: string;
  no_specific_location: boolean;

  // Etapa 2 — Categoria
  category: Category | null;

  // Etapa 3 — Macroárea
  macroarea_slug: string | null;
  macroarea_unknown: boolean;

  // Etapa 4 — Texto da contribuição
  body: string;
  /** URL pública do áudio original (se a contribuição veio de gravação). */
  audio_url: string | null;

  // Etapa 5 — Anexos
  attachments: AttachmentMeta[];

  // Etapa 6 — Identificação
  identification_mode: 'identified' | 'anonymous' | null;
  identification_name: string;
  identification_email: string;
  identification_cpf: string;

  // Etapa 7 — Consentimento
  consent_lgpd: boolean;
};

export const INITIAL_FORM_STATE: FormState = {
  location_address: '',
  no_specific_location: false,
  category: null,
  macroarea_slug: null,
  macroarea_unknown: false,
  body: '',
  audio_url: null,
  attachments: [],
  identification_mode: null,
  identification_name: '',
  identification_email: '',
  identification_cpf: '',
  consent_lgpd: false,
};

/**
 * Resposta de sucesso do POST /api/contribute.
 * status='published' quando score reCAPTCHA >= 0.7 (auto-publish, PRD §11.3).
 * status='pending' quando moderação humana é necessária.
 */
export type ContributionSuccess = {
  id: string;
  hash_short: string;
  hash_full: string;
  status: 'pending' | 'published';
  created_at: string;
};

/**
 * Envelope de erro retornado pela API.
 * `field_errors` é mapa campo→mensagem PT-BR pro front exibir inline.
 */
export type ContributionError = {
  error: string;
  detail?: string;
  field_errors?: Record<string, string>;
};
