import type { PhotoCredit as PhotoCreditData } from '@/lib/images/photos';

/**
 * Crédito da foto — exigido por todas as licenças CC com BY.
 *
 * Renderiza ultra-discreto (texto pequeno, cinza) mas sempre legível e
 * com link funcional pro autor + licença, conforme requisito da licença.
 */
export function PhotoCredit({
  photo,
  className = '',
  variant = 'inline',
}: {
  photo: PhotoCreditData;
  className?: string;
  variant?: 'inline' | 'overlay';
}) {
  const base =
    variant === 'overlay'
      ? 'absolute bottom-2 right-2 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm'
      : 'mt-1 text-[11px] text-muted-foreground';

  return (
    <p className={`${base} ${className}`}>
      Foto:{' '}
      {photo.authorUrl ? (
        <a
          href={photo.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          {photo.author}
        </a>
      ) : (
        photo.author
      )}
      {' / '}
      <a
        href={photo.licenseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        {photo.license}
      </a>
      {' via '}
      <a
        href={photo.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        Wikimedia
      </a>
    </p>
  );
}
