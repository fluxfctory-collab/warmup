/**
 * All product copy. Every statement must trace to the client brief (§2):
 * purpose, fleece and cotton, attached hook-and-loop strap, pouches for heat
 * packs, one patient keeps and may reuse it during an inpatient stay, and the
 * requested mitten (shown as a proposed design visualization).
 */

export const captions = {
  proposed: 'Proposed design visualization with integrated mitten, based on Prototype 2.4.',
  refFlatlay: 'Prototype 2.4, flat lay on a cutting mat (before the mitten update).',
  refWorn: 'Prototype 2.4, worn (fingerless hand section, before the mitten update).',
  wristSeam: 'Prototype 2.4 detail: brushed fleece meets the knit wrist section at a line of light topstitching. Colour-corrected photograph.',
  photo: 'Photograph · Prototype 2.4',
  visualization: 'Proposed visualization',
};

export const alts = {
  sleeve:
    'Proposed design visualization of the WARMUP sleeve laid flat. From the upper-arm end: a charcoal rib-knit cuff with a white hook-and-loop patch and an attached charcoal strap, a cream fleece body with one patch pouch and a dark bound slot, then a charcoal knit wrist section that closes into a mitten with a separate thumb.',
  wristSeam:
    'Close-up of Prototype 2.4 where the cream brushed fleece meets the charcoal knit wrist section, joined by a line of light topstitching.',
  strap:
    'Close-up of Prototype 2.4: the charcoal strap with its light hook-and-loop strip crossing the rib-knit cuff, which carries a white hook-and-loop patch.',
  pouch:
    'Close-up of Prototype 2.4: the patch pouch on the cream fleece, with its charcoal-bound slot and stitched rounded corner.',
  fleece: 'Close-up of the cream brushed fleece of Prototype 2.4, with its soft nap and gentle folds.',
  mitten:
    'Proposed design visualization: the charcoal knit wrist section, with its light topstitching, continuing into a mitten with a separate thumb.',
  refFlatlay:
    'Original photograph of Prototype 2.4 laid flat on a green cutting mat, with a fingerless knit hand section at the right end.',
  refWorn:
    'Original photograph of Prototype 2.4 worn on a left arm: charcoal cuff and strap at the top, cream fleece along the arm, and a fingerless charcoal knit hand section with the thumb exposed.',
};

export const hero = {
  title: 'Comfort begins with warmth.',
  descriptor: 'Arm-and-hand warming sleeve',
  lead: 'A fleece and cotton sleeve that patients wear before blood draws and peripheral IV placement, with an attached strap, heat-pack pouches and an integrated mitten.',
  primary: { label: 'Explore the sleeve', href: '#product' },
  secondary: { label: 'View the research', href: '#research' },
  /** the hero's scale line: what the sleeve covers, from end to end */
  scale: { arm: 'Upper arm', hand: 'Hand' },
};

export const intro = {
  title: 'A warming sleeve with a clear purpose.',
  points: [
    {
      label: 'What it is',
      text: 'A soft textile sleeve that covers the patient’s arm and hand, ending in an integrated mitten.',
    },
    {
      label: 'When it is used',
      text: 'Before a blood draw or peripheral IV placement, as part of preparing the arm.',
    },
    {
      label: 'How it holds warmth',
      text: 'Fleece and cotton wrap the arm and hand, and pouches can hold heat packs for additional warmth.',
    },
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
    text: 'A strap with a hook-and-loop strip is attached at the upper-arm cuff and secures the sleeve around the arm.',
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
  intro: 'Four features, numbered along the sleeve from the upper arm to the hand. Select a number to outline it.',
  useNote: {
    label: 'Intended use',
    text: 'One patient keeps the sleeve and can reuse it during their hospital stay.',
  },
  reference: {
    title: 'Prototype references',
    summary: 'Original Prototype 2.4 photographs, taken before the mitten update',
    text: 'The visualization above adds the requested mitten to Prototype 2.4. These are the original prototype photographs, shown as taken; the hand section was still fingerless.',
  },
};

/** Close-ups, numbered like the anatomy (arm to hand) so the two views
 * cross-reference. Photographs are Prototype 2.4 crops; the mitten is part
 * of the proposed design visualization and is tagged as such. */
export const construction = {
  title: 'How the sleeve is built, up close.',
  intro: 'Four parts, from the upper-arm cuff to the hand, numbered as on the sleeve above.',
  legend: {
    photo: 'A colour-corrected photograph of the prototype.',
    visualization: 'Part of the proposed design with the requested mitten; not a photograph.',
  },
  rows: [
    {
      key: 'strap' as const,
      title: 'Hook-and-loop fastening strap',
      text: 'Attached at the upper-arm cuff, the strap carries a hook-and-loop strip, and a hook-and-loop patch sits on the rib-knit cuff. It lets the sleeve be secured around the arm.',
    },
    {
      key: 'pouch' as const,
      title: 'Heat-pack pouches',
      text: 'Pouches on the sleeve can hold heat packs for additional warmth. The patch pouch shown opens through a charcoal-bound slot.',
    },
    {
      key: 'fleece' as const,
      title: 'Fleece and cotton',
      text: 'The maker describes the sleeve as high-quality fleece and cotton. A soft brushed fleece body runs between charcoal rib-knit ends.',
    },
    {
      key: 'mitten' as const,
      title: 'Integrated mitten',
      text: 'The knit wrist section continues into a mitten with a separate thumb, so the hand is covered too.',
    },
  ],
};

export const clinical = {
  title: 'Made with clinical preparation in mind.',
  blocks: [
    {
      label: 'Blood draw',
      title: 'Before a blood draw',
      text: 'The patient wears WARMUP on the arm and hand while waiting for venipuncture, so the limb is warmed ahead of the draw.',
    },
    {
      label: 'Peripheral IV',
      title: 'Before peripheral IV placement',
      text: 'The same sleeve warms the arm and hand ahead of a peripheral IV. Heat packs can be added to the pouches for additional warmth.',
    },
  ],
  retention:
    'Each sleeve belongs to one patient, who keeps it and can reuse it during their inpatient stay if needed.',
  scope: 'An overview of intended use, not a clinical protocol.',
};

export const contact = {
  title: 'Learn more about WARMUP.',
  body: 'For product information or professional enquiries, get in touch.',
  notes: [
    { label: 'Who it is for', text: 'Medical professionals and organisations with product enquiries.' },
    { label: 'Privacy', text: 'Please do not include patient information.' },
  ],
  formNote: 'This form is not connected yet, so messages are not sent.',
  privacy: 'Please do not include patient information.',
};

export const footer = {
  line: 'An arm-and-hand warming sleeve for patients, worn before blood draws and peripheral IV placement.',
  notes: [
    'Product information only. This site does not process orders.',
    'Images labelled “proposed design visualization” show the requested mitten added to Prototype 2.4. They are not photographs of a manufactured product.',
  ],
};
