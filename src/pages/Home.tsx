import Hero from '@/components/home/Hero';
import VotingCall from '@/components/home/VotingCall';
import VisionMission from '@/components/home/VisionMission';
import Programs from '@/components/home/Programs';
import Strategic from '@/components/home/Strategic';
import JejakTeaser from '@/components/home/JejakTeaser';
import Stats from '@/components/home/Stats';
import HomeMapPreview from '@/components/home/HomeMapPreview';
import News from '@/components/home/News';
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
      <VotingCall />
      <VisionMission />
      <Programs />
      <Strategic onNavigate={handleNav} />
      <JejakTeaser onNavigate={onNavigate} />
      <Stats />
      <HomeMapPreview onNavigate={onNavigate} />
      <News />
    </main>
  );
}
