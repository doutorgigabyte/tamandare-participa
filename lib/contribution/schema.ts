import { z } from 'zod';
import { CATEGORIES } from './types';
import { isValidMacroareaSlug } from './macroareas';

/**
 * Schema Zod do payload de POST /api/contribute.
 * Mensagens em PT-BR — vão direto pro field_errors do front.
 *
 * Regras principais:
 *  - body >= 50 chars (match com check do schema.sql)
 *  - category no enum
 *  - macroarea_slug opcional, mas se vier precisa existir no seed
 *  - identification.mode discriminante
 *  - consent_lgpd literal true
 */

const MAX_ATTACHMENTS = 3;
const MAX_BYTES_PER_ATTACHMENT = 5 * 1024 * 1024; // 5MB

export const attachmentMetaSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do arquivo é obrigatório.')
    .max(255, 'Nome do arquivo muito longo.'),
  size: z
    .number()
    .int()
    .positive('Tamanho do arquivo inválido.')
    .max(MAX_BYTES_PER_ATTACHMENT, 'Arquivo maior que 5 MB.'),
  type: z.string().min(1, 'Tipo MIME ausente.'),
});

const identifiedSchema = z.object({
  mode: z.literal('identified'),
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome (mínimo 2 caracteres).')
    .max(120, 'Nome muito longo (máx. 120 caracteres).'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('E-mail inválido.'),
  cpf: z
    .string()
    .trim()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos (só números).')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

const anonymousSchema = z.object({
  mode: z.literal('anonymous'),
});

export const contributionPayloadSchema = z
  .object({
    category: z.enum(CATEGORIES, {
      errorMap: () => ({ message: 'Selecione uma categoria válida.' }),
    }),
    macroarea_slug: z
      .string()
      .nullable()
      .refine(
        (v) => v === null || isValidMacroareaSlug(v),
        'Macroárea desconhecida.',
      ),
    location_address: z
      .string()
      .trim()
      .max(500, 'Endereço muito longo (máx. 500 caracteres).')
      .nullable(),
    no_specific_location: z.boolean(),
    body: z
      .string()
      .trim()
      .min(50, 'Sua contribuição precisa ter pelo menos 50 caracteres.')
      .max(5000, 'Limite de 5000 caracteres por contribuição.'),
    audio_url: z.string().url('URL de áudio inválida.').nullable().default(null),
    attachments: z
      .array(attachmentMetaSchema)
      .max(MAX_ATTACHMENTS, `Máximo de ${MAX_ATTACHMENTS} anexos.`),
    identification: z.discriminatedUnion('mode', [
      identifiedSchema,
      anonymousSchema,
    ]),
    consent_lgpd: z.literal(true, {
      errorMap: () => ({
        message: 'Você precisa concordar com o tratamento dos dados.',
      }),
    }),
    recaptcha_token: z.string().nullable(),
  })
  .superRefine((val, ctx) => {
    // Coerência: se NÃO marcou "sem local específico", precisa de endereço.
    if (!val.no_specific_location && !val.location_address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['location_address'],
        message:
          'Informe um endereço, ponto de referência ou marque "Não tem local específico".',
      });
    }
  });

export type ContributionPayload = z.infer<typeof contributionPayloadSchema>;

/**
 * Converte ZodError → { field: mensagem } chato pra UI consumir.
 * Path com múltiplos níveis vira "a.b.c".
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_form';
    // Mantém a primeira mensagem por campo (mais específica).
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
