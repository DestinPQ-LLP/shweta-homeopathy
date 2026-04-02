import { readSheet, appendToSheet, updateSheetRow, deleteSheetRow } from './google/sheets';
import { createClientDoc } from './google/docs';
import { createDriveFolder } from './google/drive';

const SHEET_ID  = () => process.env.GOOGLE_SHEETS_CLIENTS_ID || '';
const FOLDER_ID = () => process.env.GOOGLE_DRIVE_CLIENT_FOLDER_ID || '';
const TAB   = 'Clients';
const RANGE = `${TAB}!A:N`;
// Columns: id | name | email | phone | dob | address | firstConsultationDate
//          concern | notes | docId | docUrl | driveFolderId | status | createdAt
const HEADERS = ['id','name','email','phone','dob','address','firstConsultationDate',
                 'concern','notes','docId','docUrl','driveFolderId','status','createdAt'];

export interface Client {
  id: string;               // yyyymmdd_firstname
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  firstConsultationDate: string; // YYYY-MM-DD
  concern: string;
  notes: string;
  docId: string;
  docUrl: string;
  driveFolderId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function buildClientId(name: string, date: string): string {
  const d    = date.replace(/-/g, '').slice(0, 8); // yyyymmdd
  const safe = name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${d}_${safe}`;
}

function rowToClient(row: string[]): Client {
  return {
    id:                    row[0]  ?? '',
    name:                  row[1]  ?? '',
    email:                 row[2]  ?? '',
    phone:                 row[3]  ?? '',
    dob:                   row[4]  ?? '',
    address:               row[5]  ?? '',
    firstConsultationDate: row[6]  ?? '',
    concern:               row[7]  ?? '',
    notes:                 row[8]  ?? '',
    docId:                 row[9]  ?? '',
    docUrl:                row[10] ?? '',
    driveFolderId:         row[11] ?? '',
    status:                (row[12] === 'inactive' ? 'inactive' : 'active'),
    createdAt:             row[13] ?? '',
  };
}

function clientToRow(c: Client): (string | null)[] {
  return [c.id, c.name, c.email, c.phone, c.dob, c.address,
          c.firstConsultationDate, c.concern, c.notes, c.docId, c.docUrl,
          c.driveFolderId, c.status, c.createdAt];
}

async function ensureHeaders() {
  const rows = await readSheet(SHEET_ID(), RANGE);
  if (!rows || rows.length === 0) await appendToSheet(SHEET_ID(), RANGE, [HEADERS]);
}

export async function getAllClients(): Promise<Client[]> {
  const rows = await readSheet(SHEET_ID(), RANGE);
  if (!rows || rows.length <= 1) return [];
  return rows.slice(1).filter(r => r[0]).map(rowToClient);
}

export async function getClientById(id: string): Promise<{ client: Client; rowIndex: number } | null> {
  const rows = await readSheet(SHEET_ID(), RANGE);
  if (!rows || rows.length <= 1) return null;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) return { client: rowToClient(rows[i]), rowIndex: i };
  }
  return null;
}

export async function createClient(data: Omit<Client, 'id'|'docId'|'docUrl'|'driveFolderId'|'createdAt'>): Promise<Client> {
  await ensureHeaders();
  const id        = buildClientId(data.name, data.firstConsultationDate);
  const createdAt = new Date().toISOString();

  // Create a Drive subfolder for this client
  const driveFolderId = await createDriveFolder(id, FOLDER_ID());

  // Create client Google Doc in their subfolder (optional — fails gracefully if SA has no Drive quota)
  let docId = '', docUrl = '';
  try {
    const doc = await createClientDoc({ clientId: id, clientName: data.name, folderId: driveFolderId });
    docId = doc.docId; docUrl = doc.url;
  } catch (e) {
    console.warn('createClientDoc failed (SA quota?), continuing without doc link:', (e as Error).message);
  }

  const client: Client = { ...data, id, docId, docUrl, driveFolderId, createdAt };
  await appendToSheet(SHEET_ID(), RANGE, [clientToRow(client)]);
  return client;
}

export async function updateClient(id: string, data: Partial<Omit<Client, 'id'|'createdAt'>>): Promise<Client | null> {
  const found = await getClientById(id);
  if (!found) return null;
  const updated: Client = { ...found.client, ...data };
  const sheetRow = found.rowIndex + 1;
  await updateSheetRow(SHEET_ID(), `${TAB}!A${sheetRow}:N${sheetRow}`, [clientToRow(updated)]);
  return updated;
}

export async function deleteClient(id: string): Promise<boolean> {
  const found = await getClientById(id);
  if (!found) return false;
  await deleteSheetRow(SHEET_ID(), 0, found.rowIndex);
  return true;
}
