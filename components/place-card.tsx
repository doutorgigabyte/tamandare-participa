import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PhotoCredit } from './photo-credit';
import type { PhotoCredit as PhotoCreditData } from '@/lib/images/photos';

/**
 * Card visual com foto + título + descrição. Usa-se pra macroáreas, etapas
 * do diagnóstico, e qualquer bloco que se beneficie de imagem-âncora.
 */
export function PlaceCard({
  photo,
  eyebrow,
  title,
  description,
  href,
  ctaLabel = 'Saiba mais',
  tone = 'default',
}: {
  photo: PhotoCreditData;
  eyebrow?: string;
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
  tone?: 'default' | 'accent' | 'mata';
}) {
  const borderTone =
    tone === 'accent'
      ? 'hover:border-atlantico-terracota/50'
      : tone === 'mata'
        ? 'hover:border-atlantico-mata-atlantica/50'
        : 'hover:border-atlantico-mar-raso/50';

  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hero ${borderTone}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <PhotoCredit photo={photo} variant="overlay" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-atlantico-mar-profundo group-hover:gap-2.5 transition-all">
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
