import { type NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { createServiceClient } from '@/lib/supabase/server';
import { CATEGORY_CONFIG } from '@/lib/contribution/categories';
import macroareasSeed from '@/db/seed/macroareas.example.json';

/**
 * GET /api/contribute/[id]/receipt
 *
 * Gera um comprovante PDF da contribuição. Usado pelo step-confirmation pra
 * substituir o download JSON antigo.
 *
 * Conteúdo do PDF (transparência total, sem dados sensíveis):
 *   - Cabeçalho com nome da plataforma
 *   - ID curto + hash de integridade + status
 *   - Data e hora de recebimento
 *   - Nome (primeiro nome) ou "Anônimo"
 *   - Categoria + macroárea
 *   - Localização (se houver)
 *   - Conteúdo completo da contribuição
 *   - Áudio anexado (URL se houver)
 *   - Lista de anexos (nomes)
 *
 * NUNCA inclui: CPF (nem hash), email, IP, dados sensíveis de identificação.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.slug, c.label]),
);
const MACROAREA_BY_SLUG = Object.fromEntries(
  (macroareasSeed.macroareas as Array<{ slug: string; name: string }>).map(
    (m) => [m.slug, m.name],
  ),
);

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url
      && key
      && !url.includes('your-project')
      && !key.includes('REPLACE-ME'),
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'infra_pending', detail: 'Supabase indisponível.' },
      { status: 503 },
    );
  }

  // UUID validation cru — evita query desnecessária
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('contributions')
    .select(
      'id, display_name, is_anonymous, category, macroarea_slug, location_address, body, audio_url, attachments, status, hash_integrity, created_at, published_at',
    )
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[receipt] query falhou:', error);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const pdfBuffer = await buildReceiptPdf({
    id: data.id as string,
    hashIntegrity: (data.hash_integrity as string) ?? '',
    status: data.status as 'pending' | 'published',
    createdAt: data.created_at as string,
    displayName: (data.display_name as string | null) ?? null,
    isAnonymous: Boolean(data.is_anonymous),
    category: data.category as string,
    macroareaSlug: (data.macroarea_slug as string | null) ?? null,
    locationAddress: (data.location_address as string | null) ?? null,
    body: data.body as string,
    audioUrl: (data.audio_url as string | null) ?? null,
    attachments: (data.attachments as Array<{ name: string; size: number; type: string }>) ?? [],
  });

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="comprovante-tamandare-${(data.id as string).slice(0, 8)}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

// ---------------------------------------------------------------------------
// PDF builder
// ---------------------------------------------------------------------------

type ReceiptData = {
  id: string;
  hashIntegrity: string;
  status: 'pending' | 'published';
  createdAt: string;
  displayName: string | null;
  isAnonymous: boolean;
  category: string;
  macroareaSlug: string | null;
  locationAddress: string | null;
  body: string;
  audioUrl: string | null;
  attachments: Array<{ name: string; size: number; type: string }>;
};

function buildReceiptPdf(d: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 56, bottom: 56, left: 56, right: 56 },
        info: {
          Title: `Comprovante Tamandaré Participa · ${d.id.slice(0, 8)}`,
          Author: 'Tamandaré Participa',
          Subject: 'Comprovante de Contribuição ao Plano Diretor',
          Producer: 'Tamandaré Participa',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ---- Paleta Atlântico Sul (hex) -----------------------------------
      const COLOR_TINTA = '#1C2A33';
      const COLOR_NEBLINA = '#5B6B73';
      const COLOR_MAR_PROFUNDO = '#00838F';
      const COLOR_MAR_RASO = '#4DB6AC';
      const COLOR_TERRACOTA = '#C75B39';
      const COLOR_BORDER = '#E5DBC5';
      const COLOR_AREIA = '#FEF8EE';

      // ---- Cabeçalho ----------------------------------------------------
      doc
        .fillColor(COLOR_MAR_PROFUNDO)
        .fontSize(9)
        .text('TAMANDARÉ PARTICIPA', { characterSpacing: 1.5 });

      doc.moveDown(0.3);
      doc
        .fillColor(COLOR_TINTA)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('Comprovante de Contribuição');

      doc.moveDown(0.2);
      doc
        .fillColor(COLOR_NEBLINA)
        .fontSize(10)
        .font('Helvetica')
        .text(
          'Plataforma cívica de participação qualificada na revisão do Plano Diretor de Tamandaré/PE.',
          { width: 480 },
        );

      // ---- Box metadados -----------------------------------------------
      doc.moveDown(1.2);
      const boxY = doc.y;
      const boxX = 56;
      const boxW = 483; // A4 - margens
      doc
        .roundedRect(boxX, boxY, boxW, 90, 8)
        .fillAndStroke(COLOR_AREIA, COLOR_BORDER);

      doc.fillColor(COLOR_TINTA).fontSize(9);

      const col1X = boxX + 14;
      const col2X = boxX + boxW / 2 + 6;
      const innerY = boxY + 12;

      const drawKV = (label: string, value: string, x: number, y: number) => {
        doc
          .font('Helvetica')
          .fillColor(COLOR_NEBLINA)
          .fontSize(7.5)
          .text(label.toUpperCase(), x, y, { characterSpacing: 0.8 });
        doc
          .font('Helvetica-Bold')
          .fillColor(COLOR_TINTA)
          .fontSize(10)
          .text(value, x, y + 11, { width: boxW / 2 - 20 });
      };

      drawKV('ID', d.id.slice(0, 8).toUpperCase(), col1X, innerY);
      drawKV('Status', d.status === 'published' ? 'Publicada' : 'Em moderação', col2X, innerY);
      drawKV(
        'Recebido em',
        new Date(d.createdAt).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        col1X,
        innerY + 38,
      );
      drawKV(
        'Hash de integridade',
        d.hashIntegrity ? `${d.hashIntegrity.slice(0, 16)}…` : '—',
        col2X,
        innerY + 38,
      );

      doc.y = boxY + 90 + 14;

      // ---- Quem ---------------------------------------------------------
      sectionTitle(doc, 'Quem contribui', COLOR_MAR_PROFUNDO);
      const who = d.isAnonymous
        ? 'Anônimo'
        : d.displayName
          ? `${d.displayName} (identificado/a)`
          : 'Identificado/a';
      paragraph(doc, who, COLOR_TINTA);

      // ---- Categoria / Macroárea ---------------------------------------
      sectionTitle(doc, 'Tema', COLOR_MAR_PROFUNDO);
      const cat = CATEGORY_BY_SLUG[d.category] ?? d.category;
      const macro = d.macroareaSlug
        ? MACROAREA_BY_SLUG[d.macroareaSlug] ?? d.macroareaSlug
        : null;
      paragraph(
        doc,
        macro ? `${cat}  ·  ${macro}` : cat,
        COLOR_TINTA,
      );

      // ---- Localização --------------------------------------------------
      if (d.locationAddress) {
        sectionTitle(doc, 'Localização', COLOR_MAR_PROFUNDO);
        paragraph(doc, d.locationAddress, COLOR_TINTA);
      }

      // ---- Conteúdo -----------------------------------------------------
      sectionTitle(doc, 'Conteúdo da contribuição', COLOR_MAR_PROFUNDO);
      paragraph(doc, d.body, COLOR_TINTA, 11);

      // ---- Áudio --------------------------------------------------------
      if (d.audioUrl) {
        sectionTitle(doc, 'Áudio original', COLOR_TERRACOTA);
        paragraph(
          doc,
          `A contribuição foi enviada via gravação de voz. Áudio público disponível em:\n${d.audioUrl}`,
          COLOR_NEBLINA,
          9,
        );
      }

      // ---- Anexos -------------------------------------------------------
      if (d.attachments.length > 0) {
        sectionTitle(doc, 'Anexos', COLOR_MAR_PROFUNDO);
        for (const a of d.attachments) {
          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(COLOR_TINTA)
            .text(`• ${a.name}  `, { continued: true })
            .fillColor(COLOR_NEBLINA)
            .text(`(${formatSize(a.size)})`);
        }
        doc.moveDown(0.5);
      }

      // ---- Validade legal ----------------------------------------------
      doc.moveDown(1);
      doc
        .roundedRect(boxX, doc.y, boxW, 70, 8)
        .fillAndStroke('#F0F7F6', COLOR_MAR_RASO);
      const noticeY = doc.y;
      doc
        .fillColor(COLOR_MAR_PROFUNDO)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('VALIDADE E AUTENTICIDADE', boxX + 14, noticeY + 12, {
          characterSpacing: 0.8,
        });
      doc
        .fillColor(COLOR_TINTA)
        .fontSize(9)
        .font('Helvetica')
        .text(
          'Este comprovante atesta que sua contribuição foi recebida pela plataforma. O hash de integridade permite verificar que o conteúdo não foi alterado após o recebimento. A contribuição entra no relatório consolidado protocolado junto à Prefeitura de Tamandaré.',
          boxX + 14,
          noticeY + 26,
          { width: boxW - 28 },
        );

      doc.y = noticeY + 70 + 12;

      // ---- Rodapé -------------------------------------------------------
      doc
        .fillColor(COLOR_NEBLINA)
        .fontSize(8)
        .font('Helvetica')
        .text(
          `tamandareparticipa.localzai.app  ·  Gerado em ${new Date().toLocaleString('pt-BR')}  ·  Desenvolvido pela Doutor Gigabyte`,
          { align: 'center' },
        );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

function sectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  color: string,
) {
  doc.moveDown(0.8);
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(color)
    .text(title.toUpperCase(), { characterSpacing: 1.2 });
  doc.moveDown(0.3);
}

function paragraph(
  doc: PDFKit.PDFDocument,
  text: string,
  color: string,
  size = 11,
) {
  doc
    .font('Helvetica')
    .fontSize(size)
    .fillColor(color)
    .text(text, { width: 483, lineGap: 2 });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
