/**
 * Research references from the client document. Each summary says what was
 * studied and in whom, without results, temperatures, timings or
 * percentages. None of these studies evaluated WARMUP. Verification notes:
 * docs/ASSETS.md §5 and docs/HANDOFF.md.
 */
export type Reference = {
  id: string;
  year: number;
  /** short, accurate label for the compact list (the full title is in details) */
  short: string;
  /** first author et al., for the compact meta line */
  lead: string;
  journalShort: string;
  /** one faithful sentence: design and population, no results */
  brief: string;
  authors: string;
  title: string;
  journal: string;
  summary: string;
  links: { label: string; href: string }[];
};

export const researchScope =
  'These studies look at warming methods before venous access. None of them evaluated the WARMUP sleeve.';

export const researchIntro =
  'Four studies from the client’s reference list, each on local warming before peripheral venous access.';

export const references: Reference[] = [
  {
    id: 'yasuda-2023',
    year: 2023,
    short: 'Hot towel versus hot pack for forearm vein dilation',
    lead: 'Yasuda K, et al.',
    journalShort: 'J Physiol Anthropol',
    brief: 'Quasi-experimental study in 88 healthy female volunteers, measuring forearm veins after different warming methods.',
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
    short: 'Dry heat before venepuncture in children with difficult IV access',
    lead: 'Suchitra E, Srinivasan R.',
    journalShort: 'J Spec Pediatr Nurs',
    brief: 'Randomized controlled trial of dry heat in children with difficult intravenous access. A paediatric study.',
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
    short: 'Dry versus moist heat before peripheral IV cannulation',
    lead: 'Jisha K, et al.',
    journalShort: 'Nitte Univ J Health Sci',
    brief: 'Comparative study of 60 hospital patients allocated to dry heat, moist heat or no heat before cannulation.',
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
    short: 'Dry versus moist heat before peripheral IV insertion',
    lead: 'Fink RM, et al.',
    journalShort: 'Oncol Nurs Forum',
    brief: 'Randomized controlled trial in 136 hematology-oncology outpatients comparing dry and moist heat applied to the arm.',
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
