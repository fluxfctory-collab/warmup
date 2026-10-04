/**
 * Research references from the client document. Each summary says what was
 * studied and in whom, without results, temperatures, timings or
 * percentages. None of these studies evaluated WARMUP. Verification notes:
 * docs/ASSETS.md §5 and docs/HANDOFF.md.
 */
export type Reference = {
  id: string;
  year: number;
  authors: string;
  title: string;
  journal: string;
  summary: string;
  links: { label: string; href: string }[];
};

export const researchScope =
  'These studies look at warming methods before venous access. None of them evaluated the WARMUP sleeve.';

export const references: Reference[] = [
  {
    id: 'yasuda-2023',
    year: 2023,
    authors: 'Yasuda K, Shishido I, Murayama M, Kaga S, Yano R.',
    title:
      'Venous dilation effect of hot towel (moist and dry heat) versus hot pack for peripheral intravenous catheterization: a quasi-experimental study.',
    journal: 'Journal of Physiological Anthropology, 42, article 23.',
    summary:
      'A quasi-experimental study in 88 healthy female volunteers. It compared a hot pack with moist and dry hot towels applied to the forearm, measuring vein diameter by ultrasound along with how visible and palpable the veins were. A correction published in February 2024 fixed values that had been swapped in one results table.',
    links: [
      { label: 'Article (DOI)', href: 'https://doi.org/10.1186/s40101-023-00340-5' },
      { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/37858250/' },
      { label: 'Correction', href: 'https://doi.org/10.1186/s40101-024-00357-4' },
    ],
  },
  {
    id: 'suchitra-2020',
    year: 2020,
    authors: 'Suchitra E, Srinivasan R.',
    title:
      'Effectiveness of dry heat application on ease of venepuncture in children with difficult intravenous access: a randomized controlled trial.',
    journal: 'Journal for Specialists in Pediatric Nursing, 25(1), e12273.',
    summary:
      'A randomized controlled trial in children with difficult intravenous access, comparing dry heat applied at the planned insertion site with a control group. This is a paediatric study.',
    links: [
      { label: 'Article (DOI)', href: 'https://doi.org/10.1111/jspn.12273' },
      { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/31600031/' },
    ],
  },
  {
    id: 'jisha-2017',
    year: 2017,
    authors: 'Jisha K, Latha S, Joseph G.',
    title:
      'A comparative study on impact of dry versus moist heat application on feasibility of peripheral intravenous cannulation among the patients of a selected hospital at Mangalore.',
    journal:
      'Nitte University Journal of Health Science (now Journal of Health and Allied Sciences NU), 7(3).',
    summary:
      'A comparative study of 60 hospital patients in Mangalore, India, allocated to dry heat, moist heat or no heat before peripheral intravenous cannulation, looking at how feasible cannulation was in each group.',
    links: [
      { label: 'Article (DOI)', href: 'https://doi.org/10.1055/s-0040-1708719' },
      {
        label: 'Journal page',
        href: 'https://jhas-nu.in/a-comparative-study-on-impact-of-dry-versus-moist-heat-application-on-feasibility-of-peripheral-intravenous-cannulation-among-the-patients-of-a-selected-hospital-at-mangalore/',
      },
    ],
  },
  {
    id: 'fink-2009',
    year: 2009,
    authors: 'Fink RM, Hjort E, Wenger B, Cook PF, Cunningham M, Orf A, Pare W, Zwink J.',
    title:
      'The impact of dry versus moist heat on peripheral IV catheter insertion in a hematology-oncology outpatient population.',
    journal: 'Oncology Nursing Forum, 36(4), E198–E204.',
    summary:
      'A randomized controlled trial in 136 hematology-oncology outpatients at an academic cancer infusion center. It compared dry and moist heat applied to the arm before peripheral IV insertion, recording insertion attempts, insertion time, comfort and anxiety.',
    links: [
      { label: 'Article (DOI)', href: 'https://doi.org/10.1188/09.ONF.E198-E204' },
      { label: 'PubMed', href: 'https://pubmed.ncbi.nlm.nih.gov/19581223/' },
    ],
  },
];
