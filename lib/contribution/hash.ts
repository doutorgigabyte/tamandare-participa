import { createHash } from 'node:crypto';

/**
 * Hash de integridade da contribuição.
 * PRD v1.0 §5.5 + §11.
 *
 * Formato: sha256(body + '|' + isoTimestamp + '|' + (userId || 'anonymous'))
 * Determinístico — qualquer recalc com os mesmos inputs bate.
 * Persistido completo no DB, exibido como `slice(0, 12)` ao cidadão.
 */
export function computeIntegrityHash(args: {
  body: string;
  isoTimestamp: string;
  userId: string | null;
}): string {
  const userPart = args.userId ?? 'anonymous';
  const input = `${args.body}|${args.isoTimestamp}|${userPart}`;
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Hash do CPF com salt do ambiente.
 * PRD §11: CPF nunca é persistido em claro.
 *
 * Retorna null se cpf vazio. Se o salt não estiver configurado, joga —
 * a route trata isso retornando 503 (refusing to hash without salt é proposital).
 */
export function hashCpf(rawCpf: string | undefined | null): string | null {
  if (!rawCpf) return null;
  const cpf = rawCpf.replace(/\D/g, '');
  if (cpf.length !== 11) return null;

  const salt = process.env.CPF_HASH_SALT;
  if (!salt) {
    throw new Error(
      'CPF_HASH_SALT não configurado. Necessário pra LGPD-compliance.',
    );
  }
  return createHash('sha256').update(`${salt}|${cpf}`, 'utf8').digest('hex');
}
