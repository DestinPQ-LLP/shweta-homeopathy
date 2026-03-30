import type { Metadata } from 'next';
import TrackingScripts from '@/components/public/TrackingScripts';
import { getTrackingConfig } from '@/lib/landing';
import './globals.css';

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
  },
  openGraph: {
    siteName: "Dr. Shweta's Homoeopathy",
    locale: 'en_IN',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tracking = await getTrackingConfig().catch(() => ({ meta_pixel_id: '', google_ads_id: '', google_ads_label: '' }));

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
