import { cn } from '@/lib/utils';

/**
 * Bolha pequena tipo [ICR p.30] linkando pro PDF original.
 * PRD v1.0 §8.2.
 *
 * Uso:
 *   <CitationChip source="caderno" page={30} />
 *   <CitationChip source="circular" item="3" />
 */

type Props = {
  source: 'caderno' | 'circular';
  page?: number;
  item?: string | number;
  href?: string;
  className?: string;
};

const LABELS: Record<Props['source'], string> = {
  caderno: 'Caderno ICR',
  circular: 'Circular 001-2026',
};

export function CitationChip({ source, page, item, href, className }: Props) {
  const label = LABELS[source];
  const ref =
    page !== undefined
      ? `p. ${page}`
      : item !== undefined
        ? `item ${item}`
        : '';

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 py-0.5 font-mono text-[11px] text-foreground/90',
        className,
      )}
    >
      [{label}
      {ref ? `, ${ref}` : ''}]
    </span>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-opacity hover:opacity-80"
    >
      {content}
    </a>
  );
}
