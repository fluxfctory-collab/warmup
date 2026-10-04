import { images } from '../content/images';

type Props = { className?: string; sizes: string; width: number };

/** The supplied WARMUP logo (WARM UP.png), resized only. Never recoloured,
 * redrawn or animated. Always placed on white or a very pale neutral. */
export function Logo({ className, sizes, width }: Props) {
  const s = images.logo.sizes;
  const set = (ext: string) => s.map((x) => `/images/warmup-logo@${x.w}.${ext} ${x.w}w`).join(', ');
  const height = Math.round((width * images.logo.h) / images.logo.w);
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/images/warmup-logo@${s[1].w}.png`}
        srcSet={set('png')}
        sizes={sizes}
        width={width}
        height={height}
        alt="WARMUP Vein Enhancer Sleeve"
        decoding="async"
      />
    </picture>
  );
}
