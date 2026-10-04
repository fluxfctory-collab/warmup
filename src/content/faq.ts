export type Faq = { id: string; question: string; answer: string[] };

export const faqs: Faq[] = [
  {
    id: 'purpose',
    question: 'What is WARMUP designed for?',
    answer: [
      "Warming a patient's arm and hand before blood draws and peripheral IV placement. It is a sleeve for the arm only.",
    ],
  },
  {
    id: 'hand',
    question: 'Does the sleeve cover the hand?',
    answer: [
      'Yes. The design includes an integrated mitten at the hand end, so the hand is covered along with the arm.',
      'The images on this page show a proposed design visualization of the mitten, based on Prototype 2.4.',
    ],
  },
  {
    id: 'materials',
    question: 'What is it made of?',
    answer: ['The maker describes the sleeve as high-quality fleece and cotton.'],
  },
  {
    id: 'heat-packs',
    question: 'How are heat packs used with it?',
    answer: ['Pouches on the sleeve can hold heat packs for additional warmth.'],
  },
  {
    id: 'reuse',
    question: 'Can it be reused?',
    answer: [
      'It is intended for one patient to keep and reuse during their inpatient stay if needed.',
    ],
  },
  {
    id: 'buy',
    question: 'Can I buy it here?',
    answer: [
      'No. This site provides product information only and does not process orders. For enquiries, use the contact form below.',
    ],
  },
];
