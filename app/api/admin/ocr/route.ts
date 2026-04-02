import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/ocr';
import { uploadFileToDrive } from '@/lib/google/drive';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const mimeType = file.type;
  if (!ALLOWED_MIME.includes(mimeType)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, GIF images are accepted' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
  }

  const buffer     = Buffer.from(arrayBuffer);
  const imageBase64 = buffer.toString('base64');
  const filename   = (file as File).name || `note-${Date.now()}.jpg`;

  // Upload to Drive for archival
  let driveFileId = '';
  let driveFileName = filename;
  try {
    const uploaded = await uploadFileToDrive({ filename, mimeType, buffer });
    driveFileId   = uploaded.id;
  } catch (e) {
    console.error('[ocr] drive upload failed', e);
    // non-fatal — continue with OCR
  }

  try {
    const result = await extractTextFromImage(imageBase64, mimeType);
    return NextResponse.json({ ...result, driveFileId, driveFileName });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'OCR_REFUSAL') {
      return NextResponse.json({ error: 'The image could not be transcribed. Please ensure it contains clear handwritten text and try again.' }, { status: 422 });
    }
    console.error('[ocr]', err);
    return NextResponse.json({ error: 'OCR extraction failed' }, { status: 500 });
  }
}
