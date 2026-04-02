import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive, listDriveFiles, getFilePublicUrl } from '@/lib/google/drive';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function GET() {
  try {
    const files = await listDriveFiles(process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID);
    return NextResponse.json({ files });
  } catch (err) {
    console.error('[media GET]', err);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
  }

  const buffer   = Buffer.from(arrayBuffer);
  const filename = (file as File).name || `upload-${Date.now()}`;
  const mediaFolderId = process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID;

  try {
    const { id, webViewLink } = await uploadFileToDrive({ filename, mimeType: file.type, buffer, folderId: mediaFolderId });
    const publicUrl = await getFilePublicUrl(id);
    return NextResponse.json({ id, webViewLink, publicUrl, filename }, { status: 201 });
  } catch (err) {
    console.error('[media POST]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
