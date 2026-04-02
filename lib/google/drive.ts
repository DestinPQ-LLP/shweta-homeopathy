// Google Drive upload utility
import { google } from 'googleapis';
import { Readable } from 'stream';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

const DEFAULT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

export async function uploadFileToDrive(opts: {
  filename: string;
  mimeType: string;
  buffer: Buffer;
  folderId?: string;
}): Promise<{ id: string; webViewLink: string }> {
  const folderId = opts.folderId || DEFAULT_FOLDER_ID;
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const stream = Readable.from(opts.buffer);
  const res = await drive.files.create({
    requestBody: {
      name: opts.filename,
      parents: [folderId],
    },
    media: { mimeType: opts.mimeType, body: stream },
    fields: 'id,webViewLink',
  });
  return {
    id: res.data.id as string,
    webViewLink: res.data.webViewLink as string,
  };
}

export async function listDriveFiles(folderId?: string): Promise<{ id: string; name: string; mimeType: string; webViewLink: string; thumbnailLink: string; createdTime: string; size: string }[]> {
  const folder = folderId || DEFAULT_FOLDER_ID;
  const auth  = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const res   = await drive.files.list({
    q: `'${folder}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,size)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  });
  return (res.data.files || []) as { id: string; name: string; mimeType: string; webViewLink: string; thumbnailLink: string; createdTime: string; size: string }[];
}

export async function getFilePublicUrl(fileId: string): Promise<string> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });
  return `https://drive.google.com/uc?id=${fileId}`;
}

export async function createDriveFolder(name: string, parentFolderId: string): Promise<string> {
  const auth  = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const res   = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  });
  return res.data.id as string;
}
