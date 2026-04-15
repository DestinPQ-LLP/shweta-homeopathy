/**
 * gen-env-key.ts
 * Reads hyderabad-police-9073df532ddb.json and prints the GOOGLE_SERVICE_ACCOUNT_KEY
 * value ready to paste into .env.local
 *
 * Usage: npx tsx scripts/gen-env-key.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const keyPath = path.join(__dirname, '..', 'data', 'hyderabad-police-9073df532ddb.json');
if (!fs.existsSync(keyPath)) {
  console.error('❌  Service account JSON not found at:', keyPath);
  process.exit(1);
}

const raw = fs.readFileSync(keyPath, 'utf-8');
const credentials = JSON.parse(raw);
// json.dumps already escapes \n as \\n — re-serialise to single-line JSON
const singleLine = JSON.stringify(credentials);

console.log('\nCopy the line below into .env.local:\n');
console.log(`GOOGLE_SERVICE_ACCOUNT_KEY=${singleLine}`);
console.log(`\nService account email: ${credentials.client_email}`);
