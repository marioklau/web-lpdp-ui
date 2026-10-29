export type Page = 'home' | 'peta' | 'surat' | 'admin';

export interface Candidate {
  name: string;
  position: string;
  tagline: string;
  photoUrl: string;
  bio: string;
}

export interface VisionMission {
  vision: string;
  missions: string[];
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

export interface SiteContent {
  candidate: Candidate;
  visionMission: VisionMission;
  programs: Program[];
  stats: StatItem[];
  provinces: ProvinceData[];
  awardees: AwardeeProfile[];
  news: NewsItem[];
  letterTemplates: LetterTemplate[];
}
