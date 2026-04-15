import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { Playfair_Display, Inter } from 'next/font/google';
import TrackingScripts from '@/components/public/TrackingScripts';
import { getTrackingConfig } from '@/lib/landing';
import './globals.css';

// Cache tracking config in the shared Next.js build cache so all workers
// reuse one Sheets read instead of each worker fetching independently.
const getCachedTrackingConfig = unstable_cache(
  () => getTrackingConfig(),
  ['tracking-config'],
  { revalidate: 3600 },
);

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Dr. Shweta's Homoeopathy — Best Homeopath Zirakpur & Budhlada",
    template: "%s | Dr. Shweta's Homoeopathy",
  },
  description:
    "Expert homeopathic care by Dr. Shweta Goyal — BHMS Gold Medalist, MD (Hom), PG IACH Greece. Treating chronic illness, women's health, skin, joint, respiratory & pediatric conditions in Zirakpur, Punjab.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://drshwetahomoeopathy.com'),
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    siteName: "Dr. Shweta's Homoeopathy",
    locale: 'en_IN',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tracking = await getCachedTrackingConfig().catch(() => ({ meta_pixel_id: '', google_ads_id: '', google_ads_label: '' }));

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <TrackingScripts
          metaPixelId={tracking.meta_pixel_id}
          googleAdsId={tracking.google_ads_id}
          googleAdsLabel={tracking.google_ads_label}
        />
        {children}
      </body>
    </html>
  );
}
