import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive, listDriveFiles, getFilePublicUrl } from '@/lib/google/drive';

// Node runtime is required for googleapis (uses Node streams + crypto).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function errMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  // googleapis throws GaxiosError with .response.data.error.message
  const e = err as { response?: { data?: { error?: { message?: string } | string } }; message?: string };
  const apiMsg =
    typeof e.response?.data?.error === 'object'
      ? e.response?.data?.error?.message
      : typeof e.response?.data?.error === 'string'
        ? e.response?.data?.error
        : undefined;
  return apiMsg || e.message || String(err);
}

export async function GET() {
  try {
    const files = await listDriveFiles(process.env.GOOGLE_DRIVE_FOLDER_ID);
    return NextResponse.json({ files });
  } catch (err) {
    console.error('[media GET]', err);
    return NextResponse.json({ error: `Failed to list files: ${errMessage(err)}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const mediaFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!mediaFolderId) {
    return NextResponse.json({ error: 'Server is missing GOOGLE_DRIVE_FOLDER_ID env var' }, { status: 500 });
  }
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json({ error: 'Server is missing GOOGLE_SERVICE_ACCOUNT_KEY env var' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return NextResponse.json({ error: `Invalid multipart form data: ${errMessage(err)}` }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: `File type "${file.type}" not allowed` }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
  }

  const buffer   = Buffer.from(arrayBuffer);
  const filename = (file as File).name || `upload-${Date.now()}`;

  try {
    const { id, webViewLink } = await uploadFileToDrive({ filename, mimeType: file.type, buffer, folderId: mediaFolderId });
    let publicUrl = '';
    try {
      publicUrl = await getFilePublicUrl(id);
    } catch (permErr) {
      console.warn('[media POST] permission create failed (file uploaded OK):', errMessage(permErr));
    }
    return NextResponse.json({ id, webViewLink, publicUrl, filename }, { status: 201 });
  } catch (err) {
    console.error('[media POST] upload failed:', err);
    const msg = errMessage(err);
    // Common: service-account-no-quota when uploading to a non-Shared-Drive folder.
    const hint = /storage quota/i.test(msg)
      ? ' — the target folder is on a personal My Drive; service accounts have no storage quota. Move the folder into a Shared Drive and add the service account as Content Manager.'
      : /not found|file not found/i.test(msg)
        ? ' — GOOGLE_DRIVE_FOLDER_ID is wrong, or the service account has no access to that folder.'
        : '';
    return NextResponse.json({ error: `Upload failed: ${msg}${hint}` }, { status: 500 });
  }
}

