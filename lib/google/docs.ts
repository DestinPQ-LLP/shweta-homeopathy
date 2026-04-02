// Google Docs — create and update session notes + blog content
import { google } from 'googleapis';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive'],
  });
}

export async function createSessionNoteDoc(opts: {
  title: string;
  content: string;
  folderId: string;
}): Promise<{ docId: string; url: string }> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const { Readable } = await import('stream');
  const stream = Readable.from(Buffer.from(opts.content, 'utf8'));

  const res = await drive.files.create({
    requestBody: {
      name: opts.title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [opts.folderId],
    },
    media: { mimeType: 'text/plain', body: stream },
    fields: 'id',
  });

  const docId = res.data.id as string;
  return { docId, url: `https://docs.google.com/document/d/${docId}/edit` };
}

export async function updateSessionNoteDoc(docId: string, content: string) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const { Readable } = await import('stream');
  const stream = Readable.from(Buffer.from(content, 'utf8'));

  await drive.files.update({
    fileId: docId,
    media: { mimeType: 'text/plain', body: stream },
  });
}

// ─── Blog Doc functions ────────────────────────────────────────────────────────

const DEFAULT_FOLDER_ID = () => process.env.GOOGLE_DRIVE_FOLDER_ID || '';

/**
 * Create a Google Doc from HTML content for a blog post.
 * Uses Drive API to upload HTML and convert it to a Google Doc in-place.
 */
export async function createBlogDoc(opts: {
  title: string;
  htmlContent: string;
  folderId?: string;
}): Promise<{ docId: string; url: string }> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const { Readable } = await import('stream');
  const stream = Readable.from(Buffer.from(opts.htmlContent, 'utf8'));

  const res = await drive.files.create({
    requestBody: {
      name: opts.title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [opts.folderId || DEFAULT_FOLDER_ID()],
    },
    media: { mimeType: 'text/html', body: stream },
    fields: 'id',
  });

  const docId = res.data.id as string;
  return { docId, url: `https://docs.google.com/document/d/${docId}/edit` };
}

/**
 * Replace the entire content of an existing blog Doc with new HTML.
 */
export async function updateBlogDoc(docId: string, htmlContent: string): Promise<void> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const { Readable } = await import('stream');
  const stream = Readable.from(Buffer.from(htmlContent, 'utf8'));

  await drive.files.update({
    fileId: docId,
    media: { mimeType: 'text/html', body: stream },
  });
}

/**
 * Export a Google Doc as HTML for rendering on public blog pages.
 */
export async function getBlogDocHtml(docId: string): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.export(
    { fileId: docId, mimeType: 'text/html' },
    { responseType: 'text' },
  );

  return res.data as string;
}

// ─── Client notes Doc functions ───────────────────────────────────────────────

/**
 * Create a blank Google Doc for a new client and move it into their Drive folder.
 */
export async function createClientDoc(opts: {
  clientId: string;
  clientName: string;
  folderId: string;
}): Promise<{ docId: string; url: string }> {
  const auth  = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const { Readable } = await import('stream');

  const title  = `Client Notes — ${opts.clientName} [${opts.clientId}]`;
  const header = `CLIENT NOTES\n${opts.clientName} — ID: ${opts.clientId}\n${'─'.repeat(50)}\n\n`;
  const stream = Readable.from(Buffer.from(header, 'utf8'));

  const res = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [opts.folderId],
    },
    media: { mimeType: 'text/plain', body: stream },
    fields: 'id',
  });

  const docId = res.data.id as string;
  return { docId, url: `https://docs.google.com/document/d/${docId}/edit` };
}

/**
 * Append a timestamped session note entry to a client's Google Doc.
 */
export async function appendToClientDoc(docId: string, text: string, sessionDate?: string): Promise<void> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });

  // Export current content, append new entry, re-upload
  const existing = await drive.files.export(
    { fileId: docId, mimeType: 'text/plain' },
    { responseType: 'text' },
  );
  const currentText = (existing.data as string) || '';

  const dateStr = sessionDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const entry   = `\n── Session: ${dateStr} ──\n${text}\n`;
  const updated = currentText + entry;

  const { Readable } = await import('stream');
  const stream = Readable.from(Buffer.from(updated, 'utf8'));
  await drive.files.update({
    fileId: docId,
    media: { mimeType: 'text/plain', body: stream },
  });
}
