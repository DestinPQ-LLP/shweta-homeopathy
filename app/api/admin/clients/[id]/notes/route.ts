import { NextResponse } from 'next/server';
import { getClientById, updateClient } from '@/lib/clients';
import { extractTextFromImage } from '@/lib/ocr';
import { appendToClientDoc } from '@/lib/google/docs';
import { uploadFileToDrive } from '@/lib/google/drive';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const result = await getClientById(id);
    if (!result) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    const client = result.client;

    const formData  = await req.formData();
    const file      = formData.get('image') as File | null;
    const dateInput = formData.get('sessionDate') as string | null;

    if (!file) return NextResponse.json({ error: 'image file is required' }, { status: 400 });

    const buffer   = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'image/jpeg';

    // Upload image to client's Drive subfolder
    let uploadedUrl = '';
    if (client.driveFolderId) {
      const uploaded = await uploadFileToDrive({
        filename: `note_${Date.now()}_${file.name}`,
        mimeType,
        buffer,
        folderId: client.driveFolderId,
      });
      uploadedUrl = uploaded.webViewLink;
    }

    // OCR via GPT-4o
    const base64 = buffer.toString('base64');
    const ocr    = await extractTextFromImage(base64, mimeType);
    const text   = ocr.cleanedNote || ocr.rawTranscription;

    // Append to client's Google Doc
    if (client.docId) {
      await appendToClientDoc(client.docId, text, dateInput || undefined);
    }

    // Also save a brief note reference on the client row
    const prevNotes = client.notes ? client.notes + '\n' : '';
    const dateLabel = dateInput || new Date().toLocaleDateString('en-IN');
    await updateClient(id, { notes: `${prevNotes}[${dateLabel}] OCR note added` });

    return NextResponse.json({ text, uploadedUrl, uncertainItems: ocr.uncertainItems });
  } catch (err) {
    console.error('POST /api/admin/clients/[id]/notes', err);
    return NextResponse.json({ error: 'Failed to process note' }, { status: 500 });
  }
}
