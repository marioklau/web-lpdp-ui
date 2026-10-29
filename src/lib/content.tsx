import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { fetchSiteContent, isFirebaseConfigured, saveSiteContent } from '@/lib/firebase';
import {
  ContentContext,
  DEFAULT_CONTENT,
  type ContentContextValue,
  type ContentSource,
  type SaveResult,
} from '@/lib/contentContext';
import type { LetterTemplate, SiteContent } from '@/types';
import { LETTER_TEMPLATES } from '@/data';

const CACHE_KEY = 'lpdp_site_content_v2';
const CONTENT_KEYS: (keyof SiteContent)[] = [
  'candidate',
  'visionMission',
  'programs',
  'stats',
  'provinces',
  'awardees',
  'news',
  'letterTemplates',
];

interface CachePayload {
  content: SiteContent;
  pending: string[];
}

const LEGACY_TEMPLATE_IDS = new Set(['t1', 't2']);
const DEFAULT_TEMPLATE_BY_ID = new Map(
  LETTER_TEMPLATES.map((template) => [template.id, template]),
);

function resolveLetterTemplates(
  templates: LetterTemplate[] | undefined,
): LetterTemplate[] {
  if (!Array.isArray(templates)) return LETTER_TEMPLATES;
  if (templates.length === 0) return templates;
  if (templates.some((template) => LEGACY_TEMPLATE_IDS.has(template.id))) {
    return LETTER_TEMPLATES;
  }

  return templates.map((template) => {
    const fallback = DEFAULT_TEMPLATE_BY_ID.get(template.id);
    if (!fallback) return template;

    const legacy = !template.format && !template.documents?.length;
    const documents = legacy ? fallback.documents : template.documents;
    const format =
      template.format ??
      (documents?.length ? 'form' : fallback.format ?? 'text');

    return {
      ...template,
      format,
      formTitle: template.formTitle ?? fallback.formTitle,
      formNote: template.formNote ?? fallback.formNote,
      type: template.type || fallback.type,
      amount: template.amount || fallback.amount,
      fields:
        template.fields?.length
          ? template.fields
          : format === 'form'
            ? fallback.fields
            : template.fields,
      documents,
      bodyTemplate: template.bodyTemplate || fallback.bodyTemplate,
    };
  });
}

function mergeContent(base: SiteContent, patch: Partial<SiteContent>): SiteContent {
  return {
    candidate: patch.candidate
      ? { ...base.candidate, ...patch.candidate }
      : base.candidate,
    visionMission: patch.visionMission
      ? { ...base.visionMission, ...patch.visionMission }
      : base.visionMission,
    programs: Array.isArray(patch.programs) ? patch.programs : base.programs,
    stats: Array.isArray(patch.stats) ? patch.stats : base.stats,
    provinces: Array.isArray(patch.provinces) ? patch.provinces : base.provinces,
    awardees: Array.isArray(patch.awardees) ? patch.awardees : base.awardees,
    news: Array.isArray(patch.news) ? patch.news : base.news,
    letterTemplates: resolveLetterTemplates(patch.letterTemplates),
  };
}

function readCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachePayload>;
    if (!parsed.content) return null;
    const pending = Array.isArray(parsed.pending)
      ? parsed.pending.filter((key): key is keyof SiteContent =>
          CONTENT_KEYS.includes(key as keyof SiteContent),
        )
      : [];
    return { content: mergeContent(DEFAULT_CONTENT, parsed.content), pending };
  } catch {
    return null;
  }
}

function writeCache(content: SiteContent, pending: Set<string>): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ content, pending: [...pending] }),
    );
  } catch {
    /* abaikan error kuota */
  }
}

function applyRemote(
  current: SiteContent,
  remote: Partial<SiteContent>,
  pending: Set<string>,
): SiteContent {
  const next: SiteContent = { ...current };
  if (!pending.has('candidate') && remote.candidate) {
    next.candidate = { ...current.candidate, ...remote.candidate };
  }
  if (!pending.has('visionMission') && remote.visionMission) {
    next.visionMission = { ...current.visionMission, ...remote.visionMission };
  }
  if (!pending.has('programs') && Array.isArray(remote.programs)) {
    next.programs = remote.programs;
  }
  if (!pending.has('stats') && Array.isArray(remote.stats)) {
    next.stats = remote.stats;
  }
  if (!pending.has('provinces') && Array.isArray(remote.provinces)) {
    next.provinces = remote.provinces;
  }
  if (!pending.has('awardees') && Array.isArray(remote.awardees)) {
    next.awardees = remote.awardees;
  }
  if (!pending.has('news') && Array.isArray(remote.news)) {
    next.news = remote.news;
  }
  if (!pending.has('letterTemplates') && Array.isArray(remote.letterTemplates)) {
    next.letterTemplates = resolveLetterTemplates(remote.letterTemplates);
  }
  return next;
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef<CachePayload | null | undefined>(undefined);
  if (cacheRef.current === undefined) {
    cacheRef.current = readCache();
  }
  const initial = cacheRef.current?.content ?? DEFAULT_CONTENT;

  const [content, setContent] = useState<SiteContent>(initial);
  const contentRef = useRef<SiteContent>(initial);
  const pendingRef = useRef<Set<string>>(
    new Set(cacheRef.current?.pending ?? []),
  );
  const [source, setSource] = useState<ContentSource>(
    cacheRef.current ? 'local' : isFirebaseConfigured ? 'static' : 'local',
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [lastSave, setLastSave] = useState<SaveResult | null>(null);

  const loadRemote = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const remote = await fetchSiteContent();
    const merged = remote
      ? applyRemote(contentRef.current, remote, pendingRef.current)
      : contentRef.current;

    let nextSource: ContentSource | null = null;

    if (pendingRef.current.size > 0) {
      const synced = await saveSiteContent(merged);
      if (synced) {
        pendingRef.current.clear();
        writeCache(merged, pendingRef.current);
        nextSource = 'firebase';
      } else {
        nextSource = 'local';
      }
    } else if (remote) {
      writeCache(merged, pendingRef.current);
      nextSource = 'firebase';
    } else if (!cacheRef.current) {
      nextSource = 'static';
    }

    contentRef.current = merged;
    setContent(merged);
    if (nextSource) setSource(nextSource);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadRemote();
  }, [loadRemote]);

  useEffect(() => {
    const name = content.candidate.name.trim();
    document.title = name
      ? `${name} — Calon Lurah Kelurahan LPDP UI 2026`
      : 'Calon Lurah Kelurahan LPDP UI 2026';
  }, [content.candidate.name]);

  async function persist<K extends keyof SiteContent>(
    key: K,
    value: SiteContent[K],
  ): Promise<SaveResult> {
    const next = { ...contentRef.current, [key]: value };
    contentRef.current = next;
    setContent(next);

    pendingRef.current.add(key);
    writeCache(next, pendingRef.current);

    if (!isFirebaseConfigured) {
      setSource('local');
      const result: SaveResult = {
        ok: true,
        persisted: false,
        message: 'Tersimpan di browser ini (mode lokal).',
      };
      setLastSave(result);
      return result;
    }

    const saved = await saveSiteContent(next);
    if (saved) {
      pendingRef.current.clear();
      writeCache(next, pendingRef.current);
      setSource('firebase');
      const result: SaveResult = {
        ok: true,
        persisted: true,
        message: 'Tersimpan ke Firebase.',
      };
      setLastSave(result);
      return result;
    }

    setSource('local');
    const result: SaveResult = {
      ok: false,
      persisted: false,
      message:
        'Gagal menyimpan ke Firebase. Perubahan tetap tersimpan di browser ini. Pastikan Anda login dan aturan Firestore mengizinkan tulis.',
    };
    setLastSave(result);
    return result;
  }

  const value: ContentContextValue = {
    ...content,
    source,
    loading,
    lastSave,
    saveCandidate: (value) => persist('candidate', value),
    saveVisionMission: (value) => persist('visionMission', value),
    savePrograms: (value) => persist('programs', value),
    saveStats: (value) => persist('stats', value),
    saveProvinces: (value) => persist('provinces', value),
    saveAwardees: (value) => persist('awardees', value),
    saveNews: (value) => persist('news', value),
    saveLetterTemplates: (value) => persist('letterTemplates', value),
    refresh: loadRemote,
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}
