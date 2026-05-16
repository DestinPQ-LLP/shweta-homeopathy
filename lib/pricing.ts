// Consultation pricing by country (source: prices.md)
export interface PriceEntry {
  country: string;
  countryCode: string;
  duration: string;
  fee: string;
}

export const PRICING: Record<string, PriceEntry> = {
  IN: { country: 'India',                countryCode: 'IN', duration: '45 Minutes', fee: '₹500' },
  US: { country: 'United States',        countryCode: 'US', duration: '45 Minutes', fee: '$42' },
  CA: { country: 'Canada',               countryCode: 'CA', duration: '45 Minutes', fee: 'CAD 58' },
  GB: { country: 'United Kingdom',       countryCode: 'GB', duration: '45 Minutes', fee: '£38' },
  AU: { country: 'Australia',            countryCode: 'AU', duration: '45 Minutes', fee: 'AUD 70' },
  NZ: { country: 'New Zealand',          countryCode: 'NZ', duration: '45 Minutes', fee: 'NZD 76' },
  AE: { country: 'United Arab Emirates', countryCode: 'AE', duration: '45 Minutes', fee: 'AED 220' },
  SG: { country: 'Singapore',            countryCode: 'SG', duration: '45 Minutes', fee: 'SGD 68' },
  DE: { country: 'Germany',              countryCode: 'DE', duration: '45 Minutes', fee: '€42' },
  FR: { country: 'France',               countryCode: 'FR', duration: '45 Minutes', fee: '€42' },
  NL: { country: 'Netherlands',          countryCode: 'NL', duration: '45 Minutes', fee: '€42' },
  SA: { country: 'Saudi Arabia',         countryCode: 'SA', duration: '45 Minutes', fee: 'SAR 200' },
  QA: { country: 'Qatar',                countryCode: 'QA', duration: '45 Minutes', fee: 'QAR 210' },
  OM: { country: 'Oman',                 countryCode: 'OM', duration: '45 Minutes', fee: 'OMR 22' },
  KW: { country: 'Kuwait',               countryCode: 'KW', duration: '45 Minutes', fee: 'KWD 18' },
  ZA: { country: 'South Africa',         countryCode: 'ZA', duration: '45 Minutes', fee: 'ZAR 800' },
  MY: { country: 'Malaysia',             countryCode: 'MY', duration: '45 Minutes', fee: 'MYR 190' },
};

export const DEFAULT_PRICING = PRICING.US;

export function getPricingByCountry(code?: string | null): PriceEntry {
  if (!code) return DEFAULT_PRICING;
  return PRICING[code.toUpperCase()] || DEFAULT_PRICING;
}
