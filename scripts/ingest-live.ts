import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
import mammoth from 'mammoth';

const PROD_URL = "https://shweta.destinpq.com";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function parseWithLLM(text: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You extract medical data from clinical briefs. Output JSON matching the schema precisely.' },
        { role: 'user', content: `Extract the following format from this text. Ignore general notes. Return ONLY valid JSON block.
          {
            "slug": "kebab-case", "name": "Title", "shortDesc": "Short description",
            "intro": "1 paragraph overview",
            "symptoms": ["symptom 1", "symptom 2", "symptom 3", "symptom 4"],
            "howHomeopathyHelps": "1 paragraph treatment info",
            "icon": "Activity", "status": "published"
          }
          Text:
          ${text.substring(0, 4200)}` }
      ],
      temperature: 0.1
    })
  });
  
  if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);
  const data = await response.json();
  const content = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(content);
}

async function run() {
  console.log("Authenticating to Production Server: " + PROD_URL);
  
  const authRes = await fetch(`${PROD_URL}/api/admin/auth`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || 'admin1234' })
  });
  const cookieStr = (authRes.headers.get("set-cookie") || "").split(';')[0];
  
  console.log("Cookie Acquired. Parsing Docs...");

  const dir = path.join(process.cwd(), '../dummy-data');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx') && /^[0-9]+/.test(f));
  
  const allJson = [];
  const headers = { "Content-Type": "application/json", "Cookie": cookieStr };

  for (const file of files) {
    console.log(`Analyzing ${file}...`);
    const { value: text } = await mammoth.extractRawText({ path: path.join(dir, file) });
    if (text.length > 100) {
      try {
         const parsed = await parseWithLLM(text);
         parsed.icon = "Activity";
         parsed.status = "published";
         
         allJson.push(parsed);

         // Optional: Attempt to push to Live API
         const createRes = await fetch(`${PROD_URL}/api/admin/conditions`, {
            method: "POST", headers, body: JSON.stringify(parsed)
         });
         
         if (createRes.ok) {
           console.log(`✅ [PROD SUCCESS]: Ingested '${parsed.name}' to Live Sheets!`);
         } else {
           console.log(`⚠️ [PROD ERR]: Google Service Account blocked on server (HTTP ${createRes.status})`);
         }
      } catch(e: any) { console.error(`❌ Parse failed:`, e.message); }
    }
  }
  
  // Write the parsed JSON locally too so user has it if the API failed
  fs.writeFileSync('ready-to-upload.json', JSON.stringify(allJson, null, 2));
  console.log("\\nSaved extraction to 'ready-to-upload.json'.");
  console.log("You can run this anytime with `npm run script:ingest-live`.");
}

run();
