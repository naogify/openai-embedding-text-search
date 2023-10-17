const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function embedText(text) {

  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });

  return response.data[0].embedding;
}

async function main() {
  // 入力用の文章をロード
  const docs = JSON.parse(fs.readFileSync('docs.json', 'utf8'));

  const index = [];
  for (const doc of docs) {
    const embedding = await embedText(doc.body);
    index.push({
      title: doc.title,
      body: doc.body,
      embedding: embedding
    });
  }

  fs.writeFileSync('index.json', JSON.stringify(index, null, 2));
}

main().catch(error => {
  console.error("An error occurred:", error.message);
});
