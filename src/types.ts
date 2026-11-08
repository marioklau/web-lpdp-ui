export type Page =
  | 'home'
  | 'jejak'
  | 'peta'
  | 'surat'
  | 'pasar'
  | 'kos'
  | 'admin';

export interface Candidate {
  name: string;
  position: string;
  tagline: string;
  photoUrl: string;
  bio: string;
}

export interface VisionMission {
  eyebrow: string;
  title: string;
  intro: string;
  vision: string;
  missions: string[];
}

export interface HomePillar {
  id: string;
  icon: string;
  program: string;
  title: string;
  body: string;
  points: string[];
}

export interface HomePageContent {
  heroEyebrow: string;
  heroCompanion: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroSupport: string;
  heroWatermark: string;
  heroCaption: string;
  heroMarquee: string[];
  heroScrollHint: string;
  programsEyebrow: string;
  programsTitle: string;
  programsIntro: string;
  strategicEyebrow: string;
  strategicTitle: string;
  strategicLead: string;
  strategicNote: string;
  strategicCta: string;
  strategicSecondaryCta: string;
  pillars: HomePillar[];
  jejakEyebrow: string;
  jejakTitle: string;
  jejakBody: string;
  jejakCta: string;
  mapEyebrow: string;
  mapTitle: string;
  mapBody: string;
  mapPoints: string[];
  mapCta: string;
  mapCaption: string;
  statsEyebrow: string;
  statsTitle: string;
  newsEyebrow: string;
  newsTitle: string;
  contactEyebrow: string;
  contactTitle: string;
  contactIntro: string;
  contactChannelTitle: string;
  contactChannelBody: string;
  dptLabel: string;
  dptUrl: string;
  dptDisplay: string;
  whatsappLabel: string;
  phone: string;
  whatsappUrl: string;
  instagramLabel: string;
  instagramHandle: string;
  instagramUrl: string;
  email: string;
  linkedinUrl: string;
  cvUrl: string;
  address: string;
  footerBlurb: string;
  footerNote: string;
  footerCopyright: string;
  footerTagline: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  isPlaceholder?: boolean;
}

export interface ProvinceData {
  id: string;
  name: string;
  awardeeCount: number;
  activeAwardeeCount: number;
  alumniCount: number;
}

export interface AwardeeProfile {
  id: string;
  provinceId: string;
  name: string;
  occupation: string;
  photoUrl: string;
  isSample?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl: string;
}

export interface LetterDocument {
  key: string;
  label: string;
  required?: boolean;
  numbered?: boolean;
}

export interface LetterFormField {
  key: string;
  label: string;
  group?: string;
  type?: 'text' | 'textarea';
  required?: boolean;
  readOnly?: boolean;
  defaultValue?: string;
}

export interface LetterTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  amount: string;
  bodyTemplate: string;
  format?: 'form' | 'text';
  formTitle?: string;
  formNote?: string;
  fields?: LetterFormField[];
  documents?: LetterDocument[];
}


export interface LetterSubmission {
  id: string;
  templateId: string;
  templateTitle: string;
  fields: Record<string, string>;
  createdAt: string;
}

export interface Aspiration {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface MarketListing {
  id: string;
  sellerName: string;
  contact: string;
  city: string;
  title: string;
  category: string;
  condition: string;
  price: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  isSample?: boolean;
}

export type KosCampus = 'depok' | 'salemba';

export type KosGender = 'putra' | 'putri' | 'campur';

export interface KosListing {
  id: string;
  name: string;
  campus: KosCampus;
  gender: KosGender;
  address: string;
  price: number;
  facilities: string[];
  contact: string;
  imageUrl: string;
  lat: number;
  lng: number;
  notes: string;
  ratingSum: number;
  ratingCount: number;
  createdAt: string;
  isSample?: boolean;
}

export interface SiteContent {
  candidate: Candidate;
  visionMission: VisionMission;
  homepage: HomePageContent;
  programs: Program[];
  stats: StatItem[];
  provinces: ProvinceData[];
  awardees: AwardeeProfile[];
  news: NewsItem[];
  letterTemplates: LetterTemplate[];
}
