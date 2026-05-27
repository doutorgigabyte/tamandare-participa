import { NextResponse, type NextRequest } from 'next/server';
import { isAdminAuthed } from '@/lib/admin/auth';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ModerateAction = 'approve' | 'spam' | 'flag' | 'unpublish';

/**
 * POST /api/admin/moderate
 * Body: { id: string, action: 'approve' | 'spam' | 'flag' | 'unpublish' }
 *
 * Atualiza o status da contribuição. Requer cookie admin válido.
 * Loga em moderation_log (PRD §6).
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    action?: ModerateAction;
  };
  const { id, action } = body;

  if (!id || !action) {
    return NextResponse.json(
      { error: 'invalid_payload', detail: 'id e action obrigatórios.' },
      { status: 400 },
    );
  }

  const statusMap: Record<ModerateAction, string> = {
    approve: 'published',
    spam: 'spam',
    flag: 'flagged',
    unpublish: 'pending',
  };
  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json(
      { error: 'invalid_action' },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  const update: Record<string, unknown> = { status: newStatus };
  if (action === 'approve') {
    update.published_at = new Date().toISOString();
  }

  const { error: updErr } = await supabase
    .from('contributions')
    .update(update)
    .eq('id', id);

  if (updErr) {
    // eslint-disable-next-line no-console
    console.error('[admin/moderate] update falhou:', updErr);
    return NextResponse.json(
      { error: 'db_error', detail: updErr.message },
      { status: 500 },
    );
  }

  // Log de moderação (best-effort — não falha a action se o log quebrar)
  await supabase
    .from('moderation_log')
    .insert({
      contribution_id: id,
      moderator_id: null, // MVP 1: sem identidade individual da moderadora
      action,
      reason: null,
    })
    .then(({ error }) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('[admin/moderate] moderation_log insert falhou:', error.message);
      }
    });

  return NextResponse.json({ ok: true, id, status: newStatus });
}
