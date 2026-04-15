import * as dotenv from 'dotenv';
dotenv.config();

// Apply time drift patch
async function ensureTimeSynced() {
  try {
     const req = await fetch('https://oauth2.googleapis.com/token');
     const googleDate = new Date(req.headers.get('date') || '').getTime();
     const diff = googleDate - Date.now();
     const originalNow = Date.now;
     Date.now = () => originalNow() + diff;
     console.log("Clock synced.");
  } catch(e) {}
}

async function verifyPermissions() {
  await ensureTimeSynced();
  
  const { google } = require('googleapis');
  const path = require('path');
  
  const keyPath = path.join(process.cwd(), 'data', 'hyderabad-police-9073df532ddb.json');
  console.log("Testing Service Account:", keyPath);
  
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents'
    ],
  });
  
  try {
    const client = await auth.getClient();
    console.log("✅ Authenticated structure successfully.");

    // 1. Test target Drive Folder permissions
    const drive = google.drive({ version: 'v3', auth: client });
    const targetFolder = process.env.GOOGLE_DRIVE_CLIENT_FOLDER_ID;
    console.log(`Testing access to Drive Folder ID: ${targetFolder}`);
    
    try {
      const gDriveCheck = await drive.files.get({ fileId: targetFolder, fields: 'id, name, capabilities' });
      console.log(`✅ Passed: Service Account CAN view folder '${gDriveCheck.data.name}'.`);
      if (gDriveCheck.data.capabilities && gDriveCheck.data.capabilities.canAddChildren) {
          console.log(`✅ Passed: Service Account CAN create files/folders inside this directory.`);
      } else {
          console.log(`❌ Failed: Service Account CANNOT create files/folders inside this directory. (Missing Editor role)`);
      }
    } catch(e: any) {
      console.error(`❌ Failed: Could not access Drive Folder. Error: ${e.message}`);
      throw e;
    }

    // 2. Test Sheets
    const sheets = google.sheets({ version: 'v4', auth: client });
    console.log(`Testing access to Google Sheet ID: ${process.env.GOOGLE_SHEETS_CONDITIONS_ID}`);
    try {
      const sheetCheck = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SHEETS_CONDITIONS_ID });
      console.log(`✅ Passed: Service Account CAN access Sheet '${sheetCheck.data.properties.title}'.`);
    } catch(e: any) {
      console.error(`❌ Failed: Could not access Sheet. Error: ${e.message}`);
    }

  } catch(e: any) {
    console.error("Authentication/Initialization Error:", e.message);
  }
}

verifyPermissions().catch(console.error);
