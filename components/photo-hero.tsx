import Image from 'next/image';
import { PhotoCredit } from './photo-credit';
import type { PhotoCredit as PhotoCreditData } from '@/lib/images/photos';

/**
 * Hero com foto de fundo + overlay gradient + conteúdo sobreposto.
 *
 * Uso típico:
 *   <PhotoHero photo={PHOTOS.carneirosCapela} eyebrow="O futuro de Tamandaré"
 *              title="..." description="..." actions={<CTA .../>} />
 */
export function PhotoHero({
  photo,
  eyebrow,
  title,
  description,
  actions,
  height = 'tall',
}: {
  photo: PhotoCreditData;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  height?: 'short' | 'tall';
}) {
  const heightClass = height === 'tall'
    ? 'min-h-[480px] sm:min-h-[560px]'
    : 'min-h-[320px] sm:min-h-[380px]';

  return (
    <section className={`relative w-full overflow-hidden ${heightClass}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority
        className="object-cover object-[center_35%]"
        sizes="100vw"
      />
      {/* Overlay: gradient diagonal pra garantir legibilidade do texto */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-atlantico-tinta/85 via-atlantico-tinta/55 to-atlantico-tinta/20"
      />

      <PhotoCredit photo={photo} variant="overlay" />

      <div className="relative z-10 flex h-full min-h-[inherit] items-center">
        <div className="container mx-auto px-4 py-12 sm:py-14">
          <div className="max-w-2xl text-white">
            {eyebrow && (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/85">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
                {description}
              </p>
            )}
            {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
