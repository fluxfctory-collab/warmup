/**
 * All product copy. Every statement must trace to the client brief (§2):
 * purpose, fleece and cotton, attached hook-and-loop strap, pouches for heat
 * packs, one patient keeps and may reuse it during an inpatient stay, and the
 * requested mitten (shown as a proposed design visualization).
 */

export const captions = {
  proposed: 'Proposed design visualization with integrated mitten, based on Prototype\u00a02.4.',
  refFlatlay: 'Prototype 2.4, flat lay (before mitten update).',
  refWorn: 'Prototype 2.4, worn (fingerless hand section, before mitten update).',
  wristSeam: 'Prototype 2.4 detail: the fleece body meets the knit wrist section at a line of light topstitching. Colour-corrected photograph.',
};

export const alts = {
  sleeve:
    'Proposed design visualization of the WARMUP sleeve laid flat. From the upper-arm end: a charcoal rib-knit cuff with a white hook-and-loop patch and an attached charcoal strap, a cream fleece body with one patch pouch and a dark bound slot, then a charcoal knit wrist section that closes into a mitten with a separate thumb.',
  wristSeam:
    'Close-up of Prototype 2.4 where the cream brushed fleece meets the charcoal knit wrist section, joined by a line of light topstitching.',
  refFlatlay:
    'Original photograph of Prototype 2.4 laid flat on a green cutting mat, with a fingerless knit hand section at the right end.',
  refWorn:
    'Original photograph of Prototype 2.4 worn on a left arm: charcoal cuff and strap at the top, cream fleece along the arm, and a fingerless charcoal knit hand section with the thumb exposed.',
};

export const hero = {
  title: 'Comfort begins with warmth.',
  lead: 'An arm-and-hand warming sleeve for patients, worn before blood draws and peripheral IV placement.',
  body: 'Soft fleece and cotton, an attached fastening strap, and pouches for heat packs, in one simple sleeve that ends in a mitten.',
  primary: { label: 'See the sleeve', href: '#product' },
  secondary: { label: 'Read the research', href: '#research' },
  facts: ['Fleece and cotton', 'Attached strap', 'Heat-pack pouches', 'Integrated mitten'],
};

export const intro = {
  title: 'A warming sleeve with a clear purpose.',
  paragraphs: [
    'WARMUP is a textile sleeve that a patient wears on the arm and hand before a blood draw or peripheral IV placement, so the limb is kept warm ahead of venous access.',
    'Heat packs can be slipped into its pouches for extra warmth. The patient keeps the sleeve afterwards and can reuse it during their hospital stay if needed.',
  ],
  context:
    'Research has explored local warming before peripheral venous access. WARMUP brings that warming idea to a simple sleeve for the arm and hand.',
};

export type FeatureKey = 'strap' | 'pouch' | 'fleece' | 'mitten';

/** Anatomy notes, numbered along the sleeve from upper arm to hand. */
export const anatomy: {
  key: FeatureKey;
  title: string;
  text: string;
}[] = [
  {
    key: 'strap',
    title: 'Attached fastening strap',
    text: 'A strap with a hook-and-loop strip is sewn to the upper-arm cuff and secures the sleeve around the arm.',
  },
  {
    key: 'pouch',
    title: 'Heat-pack pouch',
    text: 'A patch pouch with a bound slot can hold a heat pack for additional warmth.',
  },
  {
    key: 'fleece',
    title: 'Fleece and cotton body',
    text: 'Soft, high-quality fleece and cotton surround the arm from the upper arm to the wrist.',
  },
  {
    key: 'mitten',
    title: 'Integrated mitten',
    text: 'The knit wrist section continues over the hand and closes into a mitten with a separate thumb.',
  },
];

export const details = {
  title: 'Thoughtful details, from arm to hand.',
  intro: 'Four features, numbered along the sleeve from the upper arm to the hand. Select a number to highlight it.',
  useNote: 'Made for one patient to keep and reuse during their hospital stay.',
  reference: {
    title: 'Prototype reference',
    text: 'The visualization above adds the requested mitten to Prototype 2.4. These are the original prototype photographs, shown as taken.',
  },
};

export const construction = {
  title: 'How the sleeve is built.',
  intro: 'Four parts, each with a single job, made from soft textiles.',
  rows: [
    {
      key: 'fleece' as const,
      title: 'Soft textile construction',
      text: 'The maker describes the sleeve as high-quality fleece and cotton. The fleece body runs between charcoal knit sections at the upper arm and the hand.',
    },
    {
      key: 'strap' as const,
      title: 'Attached fastening',
      text: 'A hook-and-loop strap, attached at the upper-arm end, secures the sleeve around the arm. Because it is attached, it stays with the sleeve.',
    },
    {
      key: 'pouch' as const,
      title: 'Heat-pack pouches',
      text: 'Pockets on the sleeve can hold heat packs for additional warmth. The visible pouch opens through a bound slot on its upper-arm side.',
    },
    {
      key: 'mitten' as const,
      title: 'Arm-to-hand coverage',
      text: 'The sleeve now ends in an integrated mitten, so the hand is covered along with the arm. Shown here as a proposed design visualization.',
    },
  ],
};

export const clinical = {
  title: 'Made with clinical preparation in mind.',
  blocks: [
    {
      title: 'Before a blood draw',
      text: 'The patient wears WARMUP on the arm and hand while waiting for venipuncture, so the limb is warmed ahead of the draw.',
    },
    {
      title: 'Before peripheral IV placement',
      text: 'The same sleeve warms the arm and hand ahead of a peripheral IV. Heat packs can be added to the pouches for additional warmth.',
    },
  ],
  retention:
    'Each sleeve belongs to one patient, who keeps it and can reuse it during their inpatient stay if needed.',
  scope: 'This is an overview of intended use, not a clinical protocol.',
};

export const contact = {
  title: 'Learn more about WARMUP.',
  body: 'For product information or professional enquiries, get in touch.',
  privacy: 'Please do not include patient information.',
};

export const footer = {
  line: 'WARMUP Vein Enhancer Sleeve: an arm-and-hand warming sleeve for patients, worn before blood draws and peripheral IV placement.',
};
