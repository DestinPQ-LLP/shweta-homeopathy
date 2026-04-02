import mammoth from 'mammoth';

async function test() {
  const path = '../dummy-data/01_Alopecia_Hair_Loss_Content_Brief.docx';
  const result = await mammoth.extractRawText({ path });
  console.log(result.value.substring(0, 1000));
}

test().catch(console.error);
