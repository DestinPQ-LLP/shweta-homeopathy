/**
 * Admin media route — Vercel Blob backend.
 *
 *   GET    → list every blob in the project's store (newest first).
 *   POST   → exchange a JSON body for a short-lived client upload token so the
 *            browser uploads directly to Blob storage, bypassing Vercel's
 *            4.5 MB serverless body limit.
 *   DELETE → remove a blob by URL.
 *
 * Switched off Google Drive because service accounts have 0 bytes of personal
 * Drive quota, and personal Gmail accounts can't create Shared Drives — so
 * uploads to a My Drive folder always fail with `storageQuotaExceeded`, even
 * when the service account is added as Editor.
 *
 * Required env (Vercel → Storage → Blob → connect to project):
 *   BLOB_READ_WRITE_TOKEN
 */
import { NextRequest, NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
];
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB — client uploads stream straight to Blob

function errMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  const e = err as { message?: string };
  return e.message || String(err);
}

function isImage(pathname: string) {
  return /\.(jpe?g|png|webp|gif|svg)$/i.test(pathname);
}

function guessMime(pathname: string) {
  const ext = pathname.split('.').pop()?.toLowerCase() ?? '';
  return (
    {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
    } as Record<string, string>
  )[ext] || 'application/octet-stream';
}

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN in env.' },
      { status: 500 },
    );
  }
  try {
    const { blobs } = await list({ limit: 1000 });
    // Map to the shape MediaClient already renders.
    const files = blobs
      .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
      .map((b) => ({
        id: b.url,
        name: b.pathname.split('/').pop() || b.pathname,
        mimeType: guessMime(b.pathname),
        webViewLink: b.url,
        thumbnailLink: isImage(b.pathname) ? b.url : '',
        createdTime:
          b.uploadedAt instanceof Date ? b.uploadedAt.toISOString() : String(b.uploadedAt),
        size: String(b.size),
      }));
    return NextResponse.json({ files });
  } catch (err) {
    console.error('[media GET]', err);
    return NextResponse.json(
      { error: `Failed to list files: ${errMessage(err)}` },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN in env.' },
      { status: 500 },
    );
  }
  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid JSON body: ${errMessage(err)}` },
      { status: 400 },
    );
  }
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_MIME,
        maximumSizeInBytes: MAX_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('[media] upload complete:', blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error('[media POST]', err);
    return NextResponse.json(
      { error: `Upload failed: ${errMessage(err)}` },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN in env.' },
      { status: 500 },
    );
  }
  const { url } = (await req.json().catch(() => ({ url: '' }))) as { url?: string };
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }
  try {
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[media DELETE]', err);
    return NextResponse.json(
      { error: `Delete failed: ${errMessage(err)}` },
      { status: 500 },
    );
  }
}

