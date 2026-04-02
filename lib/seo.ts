import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://drshwetahomoeopathy.com';
const SITE_NAME = "Dr. Shweta's Homoeopathy";
const DEFAULT_DESC = 'Expert homeopathic care for chronic illness, women\'s health, skin, joint, respiratory, and pediatric conditions. B.H.M.S Gold Medalist, MD (Hom), PG IACH Greece. Clinics in Zirakpur & Budhlada.';

export interface SeoConfig {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function buildMetadata(cfg: SeoConfig): Metadata {
  const { title, description = DEFAULT_DESC, path = '', noIndex = false } = cfg;
  const url = `${BASE_URL}${path}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${title} | ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      images: [{ url: cfg.image || '/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [cfg.image || '/og-default.jpg'],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function buildDoctorSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: 'Dr. Shweta Goyal',
    description: DEFAULT_DESC,
    url: BASE_URL,
    telephone: '+916284411753',
    email: 'drshwetahmc@gmail.com',
    medicalSpecialty: 'Homeopathy',
    alumniOf: [
      { '@type': 'EducationalOrganization', name: 'Panjab University' },
      { '@type': 'EducationalOrganization', name: 'International Academy of Classical Homeopathy, Greece' },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Patiala Road',
      addressLocality: 'Zirakpur',
      addressRegion: 'Punjab',
      postalCode: '140603',
      addressCountry: 'IN',
    },
    sameAs: [],
  };
}

export function buildConditionSchema(name: string, desc: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name,
    description: desc,
    url: BASE_URL,
    about: { '@type': 'MedicalCondition', name },
  };
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
