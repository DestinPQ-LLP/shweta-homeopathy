/**
 * populate-landing.ts
 *
 * Writes the default LandingConfig + TrackingConfig values into the
 * Google Sheet referenced by GOOGLE_SHEETS_LANDING_ID. Safe to re-run —
 * existing non-empty values are preserved (only blanks are filled in).
 *
 * Usage: npx tsx scripts/populate-landing.ts
 *        npx tsx scripts/populate-landing.ts --force   # overwrite all values
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import {
  getLandingConfig,
  setLandingConfig,
  getTrackingConfig,
  setTrackingConfig,
  LANDING_DEFAULTS,
  TRACKING_DEFAULTS,
} from '../lib/landing';

const FORCE = process.argv.includes('--force');

// Curated landing values for Dr. Shweta's Homoeopathy
const LANDING_VALUES = {
  headline: 'Get Lasting Relief from Chronic Conditions — Naturally',
  subheadline:
    "Personalised classical homoeopathic treatment by Dr. Shweta Goyal — BHMS Gold Medalist, MD (Hom). Safe for all ages, no side effects, and root-cause healing for skin, hormonal, digestive, joint, and respiratory disorders.",
  video_url: '',
  whatsapp_number: '916284411753',
  whatsapp_message:
    "Hi Dr. Shweta, I'd like to book a consultation. Please share available slots.",
  cta_text: 'Chat on WhatsApp Now',
};

const TRACKING_VALUES = {
  meta_pixel_id: '',
  google_ads_id: '',
  google_ads_label: '',
};

function merge<T extends object>(
  current: T,
  desired: Partial<Record<keyof T, string>>,
  defaults: T,
): T {
  const cur = current as Record<string, string>;
  const des = desired as Record<string, string>;
  const def = defaults as Record<string, string>;
  const out: Record<string, string> = { ...cur };
  for (const key of Object.keys(def)) {
    const desiredVal = des[key] ?? '';
    const currentVal = cur[key] ?? '';
    if (FORCE) {
      out[key] = desiredVal || def[key];
    } else if (!currentVal) {
      out[key] = desiredVal || def[key];
    } else {
      out[key] = currentVal;
    }
  }
  return out as T;
}

async function main() {
  if (!process.env.GOOGLE_SHEETS_LANDING_ID) {
    console.error('❌ GOOGLE_SHEETS_LANDING_ID is not set in .env / .env.local');
    process.exit(1);
  }

  console.log(`🔧 Populating landing sheet ${FORCE ? '(force overwrite)' : '(filling blanks only)'}…`);

  // ── Landing ─────────────────────────────────────────────────────
  const currentLanding = await getLandingConfig();
  const nextLanding = merge(currentLanding, LANDING_VALUES, LANDING_DEFAULTS);
  await setLandingConfig(nextLanding);
  console.log('✅ LandingConfig written:');
  console.table(nextLanding);

  // ── Tracking ────────────────────────────────────────────────────
  const currentTracking = await getTrackingConfig();
  const nextTracking = merge(currentTracking, TRACKING_VALUES, TRACKING_DEFAULTS);
  await setTrackingConfig(nextTracking);
  console.log('✅ TrackingConfig written:');
  console.table(nextTracking);

  console.log('\n🎉 Done.');
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
