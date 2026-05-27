import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Botão arredondado com cor da macroárea.
 * PRD v1.0 §8.2.
 *
 * Uso:
 *   <MacroareaPill slug="lazer-turismo" name="Lazer e Turismo" />
 */

type Props = {
  slug: string;
  name: string;
  color?: string;
  href?: string;
  className?: string;
};

export function MacroareaPill({ slug, name, color, href, className }: Props) {
  const computedHref = href ?? `/zoneamento/${slug}`;
  // Cor inline pra suportar valores dinâmicos (Tailwind purge não conhece slug).
  const style = color ? { backgroundColor: color } : undefined;

  return (
    <Link
      href={computedHref}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white transition-transform hover:scale-105',
        !color && 'bg-zinc-700',
        className,
      )}
      style={style}
    >
      <span className="h-2 w-2 rounded-full bg-white/60" aria-hidden />
      {name}
    </Link>
  );
}
