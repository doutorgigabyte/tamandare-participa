import type { AttachmentMeta } from '@/lib/contribution/types';

/**
 * lib/storage/upload.ts
 *
 * MVP 1: STUB. Anexos só persistem como metadata (name/size/type) no JSONB.
 *
 * TODO MVP 1.5: upload real para Supabase Storage bucket
 * 'contributions-attachments' (privado, RLS aberto a moderadores) e
 * substituir AttachmentMeta por { name, size, type, storage_path }.
 *
 * Estratégia futura:
 *   1. Frontend pede signed upload URL via /api/contribute/signed-url
 *   2. Browser faz PUT direto (não passa pelo serverless — economiza CPU)
 *   3. Caminho retornado vira parte do payload de /api/contribute
 *   4. Cloud Vision detect_labels nos arquivos image/* (job assíncrono)
 *
 * Por enquanto só ecoa o metadata recebido, sem persistir bytes em lugar nenhum.
 */

export type PersistedAttachment = {
  name: string;
  size: number;
  type: string;
  /** Sempre null no MVP 1 — vira string quando Storage estiver ativo. */
  storage_path: string | null;
};

export async function uploadAttachments(
  metas: AttachmentMeta[],
): Promise<PersistedAttachment[]> {
  // No-op: MVP 1 não persiste bytes.
  return metas.map((m) => ({
    name: m.name,
    size: m.size,
    type: m.type,
    storage_path: null,
  }));
}
