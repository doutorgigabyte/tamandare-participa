import Link from 'next/link';
import { Volume2, Paperclip, MapPin, User2 } from 'lucide-react';
import { CATEGORY_CONFIG } from '@/lib/contribution/categories';
import macroareasSeed from '@/db/seed/macroareas.example.json';
import type { ContributionListItem } from '@/lib/resultados/fetch';

/**
 * Card pra exibir uma contribuição pública.
 *
 * Privacidade — o que aparece e o que NÃO aparece:
 *
 * Aparece (transparência):
 *   - ID público (12 chars do hash de integridade)
 *   - Primeiro nome (se a pessoa se identificou) ou "Anônimo"
 *   - Texto completo
 *   - Áudio original (se foi gravado)
 *   - Anexos com URL pública
 *   - Categoria, macroárea, endereço
 *   - Data
 *
 * Nunca aparece:
 *   - CPF (nem hash)
 *   - Sobrenome
 *   - E-mail
 *   - UUID interno completo
 *   - IP, user-agent, qualquer telemetria
 */

type MacroareaConfig = { slug: string; name: string; display_color: string };
const CATEGORY_MAP = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.slug, c]),
);
const MACROAREA_MAP = Object.fromEntries(
  (macroareasSeed.macroareas as MacroareaConfig[]).map((m) => [m.slug, m]),
);

const SNIPPET_LEN = 320;

export function ContributionCard({
  item,
  compact = false,
}: {
  item: ContributionListItem;
  compact?: boolean;
}) {
  const cat = CATEGORY_MAP[item.category];
  const macro = item.macroarea_slug ? MACROAREA_MAP[item.macroarea_slug] : null;
  const Icon = cat?.icon;
  const body = compact && item.body.length > SNIPPET_LEN
    ? item.body.slice(0, SNIPPET_LEN) + '…'
    : item.body;

  const who = item.is_anonymous
    ? 'Anônimo'
    : item.display_name
      ? item.display_name
      : 'Identificado';

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
      {/* TOPO: tags */}
      <header className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        {cat && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-foreground/90">
            {Icon && <Icon className="h-3 w-3" aria-hidden />}
            {cat.label}
          </span>
        )}
        {macro && (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-foreground/90"
            style={{
              backgroundColor: `${macro.display_color}22`,
              borderColor: `${macro.display_color}55`,
            }}
          >
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: macro.display_color }}
            />
            {macro.name.replace(
              /^(?:Macroárea|Zona Especial) (?:de |dos? |Centro )?/,
              '',
            )}
          </span>
        )}
        {item.status === 'pending' && (
          <span className="rounded-full border border-atlantico-terracota/40 bg-atlantico-terracota-clara/30 px-2.5 py-1 text-atlantico-terracota">
            Em moderação
          </span>
        )}
        <span className="ml-auto text-muted-foreground">
          {timeAgo(item.created_at)}
        </span>
      </header>

      {/* QUEM */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <User2 className="h-3.5 w-3.5" aria-hidden />
          <span className="font-medium text-foreground">{who}</span>
        </span>
        {item.hash_short && (
          <span className="font-mono text-[11px]">
            ID {item.hash_short.slice(0, 8).toUpperCase()}
          </span>
        )}
        {item.location_address && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            <span className="line-clamp-1 max-w-[260px]">
              {item.location_address}
            </span>
          </span>
        )}
      </div>

      {/* CORPO */}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {body}
      </p>

      {/* ÁUDIO */}
      {item.audio_url && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-atlantico-mar-raso/30 bg-atlantico-mar-raso/5 p-3">
          <Volume2
            className="h-4 w-4 flex-shrink-0 text-atlantico-mar-profundo"
            aria-hidden
          />
          <div className="flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-atlantico-mar-profundo">
              Áudio original
            </p>
            <audio
              src={item.audio_url}
              controls
              className="mt-1 h-9 w-full max-w-md"
            />
          </div>
        </div>
      )}

      {/* ANEXOS */}
      {item.attachments.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Anexos
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {item.attachments.map((a, i) => (
              <li key={`${a.name}-${i}`}>
                {a.url ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground hover:border-atlantico-mar-raso/40 hover:bg-muted/70"
                  >
                    <Paperclip className="h-3 w-3" aria-hidden />
                    {a.name}
                  </a>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground"
                    title="Arquivo registrado como referência (upload pendente)"
                  >
                    <Paperclip className="h-3 w-3" aria-hidden />
                    {a.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  if (seconds < 60) return formatter.format(-seconds, 'second');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return formatter.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  return formatter.format(-days, 'day');
}
