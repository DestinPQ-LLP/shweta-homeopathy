import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollProgressRail from '@/components/public/ScrollProgressRail';
import ContextualStickyBar from '@/components/public/ContextualStickyBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgressRail />
      <Header />
      <main style={{ paddingTop: 'var(--header-h)' }}>
        {children}
      </main>
      <Footer />
      <ContextualStickyBar />
    </>
  );
}
