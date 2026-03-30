import type { Metadata } from 'next';
import { getLandingConfig } from '@/lib/landing';
import { getPublishedTestimonials } from '@/lib/testimonials';
import { faqs } from '@/lib/content';
import AdsHero from '@/components/public/AdsHero';
import AdsTestimonials from '@/components/public/AdsTestimonials';
import AdsFaq from '@/components/public/AdsFaq';
import AdsFooter from '@/components/public/AdsFooter';

export const metadata: Metadata = {
  title: "Dr. Shweta's Homoeopathy — Natural Healing",
  description:
    "Get lasting relief from chronic conditions with classical homeopathic treatment by Dr. Shweta Goyal. Safe, effective, no side effects.",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

export default async function AdsPage() {
  const [config, liveTestimonials] = await Promise.all([
    getLandingConfig(),
    getPublishedTestimonials().catch(() => []),
  ]);

  return (
    <>
      <AdsHero config={config} />
      <AdsTestimonials testimonials={liveTestimonials} />
      <AdsFaq faqs={faqs} />
      <AdsFooter config={config} />
    </>
  );
}
