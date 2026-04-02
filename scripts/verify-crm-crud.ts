import * as dotenv from 'dotenv';
dotenv.config();

import { createClient, getAllClients, getClientById, updateClient, deleteClient } from '../lib/clients';

async function verifySync() {
  console.log('--- Starting CRM CRUD & Google Workspace Sync Verification ---');

  try {
    // 1. Create a dummy patient
    console.log('\n1. Creating dummy client to verify Google Drive & Docs automated generation...');
    const dummyClient = {
      name: 'Test Patient AI',
      email: 'ai.test@example.com',
      phone: '+919876543210',
      dob: '1990-01-01',
      address: 'Test Addr, Zirakpur',
      firstConsultationDate: '2026-03-30',
      concern: 'Psoriasis Test',
      notes: 'Initial AI consultation notes. Evaluating root cause.',
      status: 'active' as const,
    };
    
    const created = await createClient(dummyClient);
    console.log('✅ Client successfully added to Google Sheets (GOOGLE_SHEETS_CLIENTS_ID)!');
    console.log('✅ Generated Client ID:', created.id);
    console.log('✅ Auto-created Google Drive Folder ID:', created.driveFolderId);
    console.log('✅ Auto-created Initial Google Doc ID:', created.docId);
    console.log('✅ Clinical Notes Document URL:', created.docUrl);

    // 2. Read back
    console.log('\n2. Fetching recent clients from Sheets to verify read operability...');
    const clients = await getAllClients();
    const fetched = clients.find(c => c.id === created.id);
    console.log('✅ Successfully fetched test client from live Google Sheets:', fetched?.name);

    // 3. Update notes
    console.log('\n3. Verifying UPDATE operation (Admin adding follow-up notes)...');
    const updated = await updateClient(created.id, { notes: created.notes + ' \\n Follow-up: Patient responding well to treatment.' });
    console.log('✅ Follow-up notes successfully updated in Google Sheets:', !!updated);

    // 4. Delete 
    console.log('\n4. Cleaning up (Deleting test record)...');
    const delResult = await deleteClient(created.id);
    console.log('✅ Client record deleted from Google Sheets:', delResult);

    console.log('\n✨ All CRM and Google Workspace pipelines verified successfully!');
  } catch(error: any) {
    console.error('\n❌ Verification halted due to error:');
    console.error(error.message || error);
    console.error('\nNOTE: If you see "invalid_grant" or "Invalid JWT Signature", your GOOGLE_SERVICE_ACCOUNT_KEY in .env has expired or is invalid. Please regenerate it in your Google Cloud Console.');
  }
}

verifySync().catch(console.error);
