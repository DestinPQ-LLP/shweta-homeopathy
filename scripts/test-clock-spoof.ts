import * as dotenv from 'dotenv';
dotenv.config();

// 1. Get real Google time
async function run() {
  console.log("Fetching real time from google.com...");
  const req = await fetch('https://oauth2.googleapis.com/token');
  const googleDate = new Date(req.headers.get('date') || '').getTime();
  console.log("Real Google Time:", new Date(googleDate).toISOString());
  console.log("Local Fake Time:", new Date().toISOString());
  
  const diff = googleDate - Date.now();
  console.log("Time difference (ms):", diff);
  
  // 2. Monkey-patch Date.now and new Date
  const originalNow = Date.now;
  Date.now = () => originalNow() + diff;
  /* (Skipped full Date patching for a moment to see if Date.now is enough, 
     google-auth-library uses Math.floor(Date.now() / 1000) for iat/exp usually).
  */

  const { google } = require('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const client = await auth.getClient();
  console.log("Client acquired successfully with mocked time!");
}

run().catch(console.error);
