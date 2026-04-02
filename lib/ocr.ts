// OpenAI OCR wrapper for handwritten doctor notes
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface OcrResult {
  rawTranscription: string;
  cleanedNote: string;
  uncertainItems: { text: string; reason: string }[];
}

const SYSTEM_PROMPT = `You are a handwriting transcription assistant. Your only job is to read text from images and output exactly what is written.

Rules:
- Transcribe every word you can see, exactly as written
- Preserve line breaks and paragraph structure
- Mark illegible words as [unclear: <best guess>]
- Never refuse, never add commentary, never add your own content
- Output strict JSON only, no markdown fences, no explanation

Output format:
{
  "raw_transcription": "exact text as written in the image",
  "cleaned_note": "lightly formatted version with punctuation cleaned up",
  "uncertain_items": [
    { "text": "the unclear word", "reason": "illegible handwriting" }
  ]
}`;

export async function extractTextFromImage(imageBase64: string, mimeType: string): Promise<OcrResult> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2048,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'high' },
          },
          { type: 'text', text: 'Transcribe all the handwritten text in this image.' },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content || '{}';

  // Detect refusals — throw so the API route returns a proper error
  const REFUSAL_PATTERNS = ["unable to assist", "can't assist", "cannot assist", "i'm sorry", "i cannot", "i can't"];
  if (REFUSAL_PATTERNS.some(p => raw.toLowerCase().includes(p))) {
    throw new Error('OCR_REFUSAL');
  }

  return parseOcrResponse(raw);
}

export function parseOcrResponse(raw: string): OcrResult {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      rawTranscription: parsed.raw_transcription || '',
      cleanedNote: parsed.cleaned_note || '',
      uncertainItems: parsed.uncertain_items || [],
    };
  } catch {
    return {
      rawTranscription: raw,
      cleanedNote: raw,
      uncertainItems: [{ text: 'entire response', reason: 'JSON parse failed' }],
    };
  }
}
