/**
 * upload-photos.ts
 * Uploads key photos from /public/photos/ to Google Drive media folder.
 * Run: npx tsx scripts/upload-photos.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import { Readable } from 'stream';

const PHOTOS_DIR = path.join(__dirname, '../public/photos');
const PUBLIC_DIR = path.join(__dirname, '../public');

// ── Key photos to upload (doctor, clinic, testimonials, blog covers) ──────────
const KEY_PHOTOS = [
  // Doctor photos
  '17650_drshweta.jpg',
  '17686_Dr__Shweta_Goyal_In_clinic.jpg',
  '17543_doctor-pic.jpg',
  '17544_doctorpic1.jpg',
  '17677_aboutdoctor.jpg',
  '17678_doctoreducation.jpg',
  '17679_doctorpractice.jpg',
  '17690_drintro.jpg',
  '17697_doctor-patient.jpg',
  '17707_doctor-practice.jpg',
  
  // Clinic photos
  '17778_Zirakpur_Clinic.jpg',
  '17788_clinic2.jpg',
  '17795_Dr__Shweta_in_Clinic.jpg',
  
  // Logo
  '18884_Dr_shweta_s_Homoepathy_logo.webp',
  
  // Awards
  '18395_award2.jpg',
  '18396_award.jpg',
  '18397_award-pic1.jpg',
  '18403_awards-2.jpg',
  '18427_draward.jpg',
  
  // Testimonial photos
  '17593_shalijatestimonial.jpg',
  '17597_yogeshtestimonial.jpg',
  '17599_richatestimonial.jpg',
  '17613_deshbir-testimonial.jpg',
  '17618_arvindertestimonial.jpg',
  
  // Blog cover images
  '17981_covid19-homoeopathy-solution.jpg',
  '17836_for-all-ages-and-sex.jpg',
  '17833_healthy-you.jpg',
  '17830_permanent-cure-homoeopathy.jpg',
  '17824_healthy-baby-with-Homoeopathy.jpg',
  '17821_seasonal-treatment.jpg',
  '18296_Handle-your-Emergencie.jpg',
  '18924_Homeopathic_Remedies_for_Stress_and_Anxi.jpeg',
  '18926_AdobeStock_1547067804_Preview.jpeg',
  '18947__Severe_Eczema_Healed_Naturally_with_Hom.jpeg',
  '18965_homeopathy_for_anxiety_and_fits_recovery.jpg',
  '18980_Pityriasis_Alba___Before_Homeopathy_Trea.jpeg',
  '18981_Pityriasis_Alba___After_Homeopathy_Treat.jpeg',
  '18997__ACL_Tear_Recovery_Success_Story___Crick.jpeg',
  '19013_WhatsApp-Image-2025-10-24-at-3_21_56-PM_.jpeg',
  '19005_Test_report_image.png',
  
  // Homepage banners
  '18580_homoeopathy-top-banner.jpg',
  '18581_website-top-banner.jpg',
  '18638_homopathy-home-banner-2.jpg',
  '18639_homopathy-home-banner-22.jpg',
  '18640_homopathy-home-banner-3.jpg',
  
  // Condition page images
  '17295_hairfallsolution.jpg',
  '17314_depressionandanxiety.jpg',
  '17326_cancerhomeopathy.jpg',
  '17336_diabetes-homeopathy.jpg',
  '17425_digestionprocess.jpg',
  '17435_geriatric-disorders.jpg',
  '17445_jointproblems.jpg',
  '17873_skindisorders.jpg',
  '17866_espiratory-Diseases.jpg',
  '17859_kidshomeopathy.jpg',
  '17284_femaledeseases.jpg',
  '17895_thyroid-main.jpg',
];

// ── Load .env ─────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim();
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
}

// ── Google Auth ──────────────────────────────────────────────────────────────
function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  
  let credentials: any;
  try {
    credentials = JSON.parse(raw);
  } catch {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
    const keyMatch = envContent.match(/GOOGLE_SERVICE_ACCOUNT_KEY=(\{[\s\S]*?\})\n/);
    if (!keyMatch) throw new Error('Cannot parse GOOGLE_SERVICE_ACCOUNT_KEY');
    credentials = JSON.parse(keyMatch[1]);
  }
  
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }
  
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
  };
  return types[ext] || 'image/jpeg';
}

async function uploadPhoto(
  drive: any,
  folderId: string,
  filename: string,
  filePath: string
): Promise<{ id: string; url: string }> {
  const mimeType = getMimeType(filename);
  const fileContent = fs.readFileSync(filePath);
  const stream = Readable.from(fileContent);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id,webViewLink,webContentLink',
  });

  const fileId = res.data.id;
  
  // Make the file publicly readable
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    id: fileId,
    url: `https://drive.google.com/uc?id=${fileId}`,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🖼️  Starting photo upload to Google Drive...\n');
  
  loadEnv();
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  
  const folderId = process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID || '';
  if (!folderId) throw new Error('GOOGLE_DRIVE_MEDIA_FOLDER_ID is not set');
  
  console.log(`📁 Target Drive folder: ${folderId}`);
  console.log(`   https://drive.google.com/drive/folders/${folderId}\n`);
  
  // Check which files exist locally
  const localPhotos = fs.readdirSync(PHOTOS_DIR);
  const toUpload = KEY_PHOTOS.filter(f => localPhotos.includes(f));
  const missing = KEY_PHOTOS.filter(f => !localPhotos.includes(f));
  
  if (missing.length > 0) {
    console.log(`⚠️  ${missing.length} files not found locally (skipping):`);
    missing.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }
  
  console.log(`📤 Uploading ${toUpload.length} photos...\n`);
  
  const urlMap: Record<string, string> = {};
  
  for (let i = 0; i < toUpload.length; i++) {
    const filename = toUpload[i];
    const filePath = path.join(PHOTOS_DIR, filename);
    
    try {
      process.stdout.write(`  [${i + 1}/${toUpload.length}] ${filename}... `);
      const result = await uploadPhoto(drive, folderId, filename, filePath);
      urlMap[filename] = result.url;
      console.log(`✓ ${result.url}`);
    } catch (e: any) {
      console.log(`✗ ${e.message}`);
    }
  }
  
  // Save URL map to a JSON file for reference
  const outputPath = path.join(__dirname, '../public/photo-url-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(urlMap, null, 2));
  
  console.log(`\n✅ Upload complete!`);
  console.log(`   URL map saved to: public/photo-url-map.json`);
  console.log(`   ${Object.keys(urlMap).length} photos uploaded`);
}

main().catch((e) => {
  console.error('\n❌ Error:', e.message);
  process.exit(1);
});
