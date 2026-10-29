import Hero from '@/components/home/Hero';
import VisionMission from '@/components/home/VisionMission';
import Programs from '@/components/home/Programs';
import Stats from '@/components/home/Stats';
import HomeMapPreview from '@/components/home/HomeMapPreview';
import News from '@/components/home/News';
import AspirationContact from '@/components/home/AspirationContact';
import type { Page } from '@/types';

interface HomeProps {
  onNavigate: (page: Page, anchor?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const handleNav = (page: Page, anchor?: string) => {
    if (anchor) {
      onNavigate(page, anchor);
    } else {
      onNavigate(page);
    }
  };

  return (
    <main>
      <Hero onNavigate={handleNav} />
      <VisionMission />
      <Programs />
      <Stats />
      <HomeMapPreview onNavigate={onNavigate} />
      <News />
      <AspirationContact />
    </main>
  );
}
