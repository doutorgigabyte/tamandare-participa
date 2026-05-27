import { z } from 'zod';

/**
 * Zod schema do payload do POST /api/chat.
 *
 * Validações:
 *   - message: 3..2000 chars (questions reais ficam tipicamente em <500)
 *   - session_id opcional (UUID gerado no client; se ausente, server cria)
 */
export const chatPostSchema = z.object({
  message: z
    .string()
    .min(3, 'Sua pergunta precisa ter pelo menos 3 caracteres.')
    .max(2000, 'Pergunta muito longa — encurte para até 2000 caracteres.')
    .transform((s) => s.trim()),
  session_id: z.string().uuid('Session ID inválido.').nullable().optional(),
});

export type ChatPostInput = z.infer<typeof chatPostSchema>;

export function formatChatErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join('.') || 'root';
    out[path] = issue.message;
  }
  return out;
}
