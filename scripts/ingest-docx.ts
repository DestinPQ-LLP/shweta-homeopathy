import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mammoth from 'mammoth';
import { createCondition, getAllConditions, deleteCondition } from '../lib/healing-conditions';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function parseWithLLM(text: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an assistant that extracts condition data from medical briefs into a strict JSON schema.' },
        { role: 'user', content: `Extract the following format from this text. Ignore any general UI structure notes. Focus on the medical content (Overview, Symptoms, How it helps). Return ONLY valid JSON, no markdown. 
          { 
            "slug": "kebab-case-title", 
            "name": "Title of the condition", 
            "shortDesc": "1-2 sentence short description. Keep it concise.", 
            "intro": "1 paragraph overview/intro", 
            "symptoms": ["symptom 1", "symptom 2", "symptom 3", "symptom 4", "symptom 5"], 
            "howHomeopathyHelps": "1 paragraph on treatment philosophy regarding this condition", 
            "icon": "Activity", 
            "status": "published" 
          }
          
          Text:
          ${text.substring(0, 4000)}` }
      ],
      temperature: 0.1
    })
  });
  
  if (!response.ok) {
     const text = await response.text();
     throw new Error(`OpenAI API Error: ${text}`);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(content);
}

async function run() {
  if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY in process.env");

  const dir = path.join(process.cwd(), '../dummy-data');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx') && /^\d+/.test(f));
  
  console.log(`Found ${files.length} docx files. Wiping existing conditions in DB...`);
  
  const existing = await getAllConditions(true);
  for (const c of existing) {
    console.log(`Deleting ${c.slug}...`);
    await deleteCondition(c.slug);
  }

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(dir, file);
    const { value: text } = await mammoth.extractRawText({ path: filePath });
    
    if (text.trim().length > 100) {
      try {
         const parsed = await parseWithLLM(text);
         parsed.icon = "Activity";
         parsed.status = "published";
         await createCondition(parsed);
         console.log(`✅ Inserted: ${parsed.name}`);
      } catch(e) {
         console.error(`❌ Failed to parse/insert ${file}:`, e);
      }
    }
  }
  console.log("Done!");
}

run().catch(console.error);
