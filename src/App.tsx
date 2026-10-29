import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Peta from '@/pages/Peta';
import Surat from '@/pages/Surat';
import Admin from '@/pages/Admin';
import { ContentProvider } from '@/lib/content';
import type { Page } from '@/types';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [anchor, setAnchor] = useState<string | undefined>();

  const navigate = (p: Page, a?: string) => {
    setPage(p);
    setAnchor(a);
    if (!a) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to anchor when navigating within home
  useEffect(() => {
    if (page === 'home' && anchor) {
      const t = setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        setAnchor(undefined);
      }, 80);
      return () => clearTimeout(t);
    }
  }, [page, anchor]);

  return (
    <ContentProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar page={page} onNavigate={navigate} />
        <div className="flex-1">
          {page === 'home' && <Home onNavigate={navigate} />}
          {page === 'peta' && <Peta />}
          {page === 'surat' && <Surat />}
          {page === 'admin' && <Admin />}
        </div>
        <Footer onNavigate={navigate} />
      </div>
    </ContentProvider>
  );
}

export default App;
