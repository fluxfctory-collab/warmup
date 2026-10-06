import { imageManifest } from './images.generated';

const BASE = '/images/';

type Size = { readonly w: number; readonly h: number };

export function srcset(name: string, sizes: readonly Size[], ext: string) {
  return sizes.map((s) => `${BASE}${name}@${s.w}.${ext} ${s.w}w`).join(', ');
}

export function largest(name: string, sizes: readonly Size[], ext: string) {
  const s = sizes[sizes.length - 1];
  return { src: `${BASE}${name}@${s.w}.${ext}`, width: s.w, height: s.h };
}

export const images = {
  flatlay: { name: 'warmup-sleeve-with-mitten-flatlay', fallback: 'png', ...imageManifest.flatlay },
  vertical: { name: 'warmup-sleeve-with-mitten-vertical', fallback: 'png', ...imageManifest.vertical },
  wristSeam: { name: 'warmup-detail-wrist-seam', fallback: 'jpg', ...imageManifest.crops['wrist-seam'] },
  crop: {
    fleece: { name: 'warmup-detail-fleece', fallback: 'jpg', ...imageManifest.crops.fleece },
    strap: { name: 'warmup-detail-strap', fallback: 'jpg', ...imageManifest.crops.strap },
    pouch: { name: 'warmup-detail-pouch', fallback: 'jpg', ...imageManifest.crops.pouch },
    mitten: { name: 'warmup-detail-mitten', fallback: 'jpg', ...imageManifest.crops.mitten },
  },
  refFlatlay: { name: 'prototype-2-4-flatlay-original', fallback: 'jpg', ...imageManifest.refFlatlay },
  refWorn: { name: 'prototype-2-4-worn-original', fallback: 'jpg', ...imageManifest.refWorn },
  logo: imageManifest.logo,
  hotspots: imageManifest.hotspots,
  hotspotsVertical: imageManifest.hotspotsVertical,
  boxes: imageManifest.boxes,
  boxesVertical: imageManifest.boxesVertical,
} as const;

export type ImageSet = {
  name: string;
  fallback: string;
  w: number;
  h: number;
  sizes: readonly Size[];
};
