import { createContext, useContext } from 'react';
import {
  AWARDEE_PROFILES,
  CANDIDATE,
  LETTER_TEMPLATES,
  NEWS,
  PROGRAMS,
  PROVINCE_DATA,
  STATS,
  VISION_MISSION,
} from '@/data';
import type {
  AwardeeProfile,
  Candidate,
  LetterTemplate,
  NewsItem,
  Program,
  ProvinceData,
  SiteContent,
  StatItem,
  VisionMission,
} from '@/types';

export type ContentSource = 'firebase' | 'local' | 'static';

export interface SaveResult {
  ok: boolean;
  persisted: boolean;
  message: string;
}

export interface ContentContextValue extends SiteContent {
  source: ContentSource;
  loading: boolean;
  lastSave: SaveResult | null;
  saveCandidate: (value: Candidate) => Promise<SaveResult>;
  saveVisionMission: (value: VisionMission) => Promise<SaveResult>;
  savePrograms: (value: Program[]) => Promise<SaveResult>;
  saveStats: (value: StatItem[]) => Promise<SaveResult>;
  saveProvinces: (value: ProvinceData[]) => Promise<SaveResult>;
  saveAwardees: (value: AwardeeProfile[]) => Promise<SaveResult>;
  saveNews: (value: NewsItem[]) => Promise<SaveResult>;
  saveLetterTemplates: (value: LetterTemplate[]) => Promise<SaveResult>;
  refresh: () => Promise<void>;
}

export const DEFAULT_CONTENT: SiteContent = {
  candidate: CANDIDATE,
  visionMission: VISION_MISSION,
  programs: PROGRAMS,
  stats: STATS,
  provinces: PROVINCE_DATA,
  awardees: AWARDEE_PROFILES,
  news: NEWS,
  letterTemplates: LETTER_TEMPLATES,
};

export const ContentContext = createContext<ContentContextValue | null>(null);

export function useContent(): ContentContextValue {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent harus dipakai di dalam ContentProvider');
  }
  return context;
}
