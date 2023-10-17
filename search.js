const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// データベースの読み込み
const INDEX = JSON.parse(fs.readFileSync('index.json', 'utf8'));

// これが検索用の文字列
const QUERY = 'なんか甘くてオレンジのやつ';

async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return response.data[0].embedding;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function main() {
  const query = await getEmbedding(QUERY);

  const results = INDEX.map(doc => ({
    title: doc.title,
    body: doc.body,
    similarity: cosineSimilarity(doc.embedding, query)
  }));

  results.sort((a, b) => b.similarity - a.similarity);

  // 結果の表示
  console.log(`Query: ${QUERY}`);
  console.log("Rank: Title Similarity");
  for (let i = 0; i < results.length; i++) {
    console.log(`${i + 1}: ${results[i].title} ${results[i].similarity}`);
  }

  console.log("====Best Doc====");
  console.log(`title: ${results[0].title}`);
  console.log(`body: ${results[0].body}`);

  console.log("====Worst Doc====");
  console.log(`title: ${results[results.length - 1].title}`);
  console.log(`body: ${results[results.length - 1].body}`);
}

main().catch(error => {
  console.error("An error occurred:", error.message);
});
