import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <Header />
        <main style={{ paddingTop: 'var(--header-h)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
