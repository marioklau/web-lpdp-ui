import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  bumpSiteMetric,
  subscribeSiteMetrics,
  type SiteMetrics,
} from '@/lib/firebase';

const VIEW_KEY = 'aksara_view_session';
const LOVE_KEY = 'aksara_love_v2';

interface SitePulseValue extends SiteMetrics {
  loved: boolean;
  giveLove: () => void;
}

const SitePulseContext = createContext<SitePulseValue | null>(null);

export function formatCount(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function SitePulseProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<SiteMetrics>({ views: 0, loves: 0 });
  const [loved, setLoved] = useState(() => {
    try {
      return localStorage.getItem(LOVE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const loveLock = useRef(loved);

  useEffect(() => subscribeSiteMetrics(setMetrics), []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(VIEW_KEY)) return;
      sessionStorage.setItem(VIEW_KEY, '1');
    } catch {
      return;
    }
    void bumpSiteMetric('views');
  }, []);

  const giveLove = () => {
    if (loveLock.current) return;
    loveLock.current = true;
    setLoved(true);
    setMetrics((current) => ({ ...current, loves: current.loves + 1 }));
    void bumpSiteMetric('loves').then((ok) => {
      if (ok) {
        try {
          localStorage.setItem(LOVE_KEY, '1');
        } catch {
          /* penyimpanan lokal tidak tersedia */
        }
        return;
      }
      loveLock.current = false;
      setLoved(false);
      setMetrics((current) => ({
        ...current,
        loves: Math.max(0, current.loves - 1),
      }));
    });
  };

  return (
    <SitePulseContext.Provider value={{ ...metrics, loved, giveLove }}>
      {children}
    </SitePulseContext.Provider>
  );
}

export function useSitePulse(): SitePulseValue {
  const value = useContext(SitePulseContext);
  if (!value) {
    throw new Error('useSitePulse harus dipakai di dalam SitePulseProvider');
  }
  return value;
}
